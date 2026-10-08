/**
 * GET /membership — Google OAuth landing route.
 *
 * Google is configured to send users back to https://batesai.org/membership
 * (no trailing slash), which Cloudflare Pages would otherwise 308 to
 * /membership/ and serve as a static page. That static page used to redeem the
 * ?code in the browser, which is fragile: authorization codes are single-use,
 * so any reload, back/forward restore, bfcache resume, prefetch or webview
 * replay of that URL redeems an already-spent code and Google answers
 * invalid_grant. The user sees a failure even though the first redemption
 * succeeded.
 *
 * This function shadows the bare /membership path so the code is redeemed
 * server-side, exactly once, and never reaches a document the browser can
 * re-execute. The browser only ever sees /membership/?signed_in=1 (session
 * cookie already set) or /membership/?error=<reason>.
 *
 * Without a ?code this route reproduces the trailing-slash redirect it
 * replaces, so /membership keeps behaving exactly as before.
 *
 * Return path: if sign-in began at /api/auth/oauth/google?return_to=<path>,
 * an oauth_return_to cookie names where to land instead of /membership/ —
 * <path>?signed_in=1 on success, <path>?signin_error=<reason> on failure —
 * and is cleared on the way out. Without that cookie every response here is
 * exactly what it was before; DaemonManager's sign-in webview depends on
 * seeing /membership/?signed_in=1. See functions/_lib/return-to.js.
 *
 * Copyright (c) 2026 Bates LLC. All rights reserved.
 */

import { RETURN_TO_COOKIE, CLEAR_RETURN_TO_COOKIE, safeReturnPath } from './_lib/return-to.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  // Pages also routes /membership/ (trailing slash) to this file. Only the
  // bare path is the OAuth landing; the page itself is the static build. Left
  // to the code below, /membership/ would 308 to itself forever, which is what
  // the 7eea212f deployments did (curl: "Maximum redirects followed").
  if (url.pathname !== '/membership') return context.next();
  const target = new URL('/membership/', url.origin);
  // null unless this sign-in started with ?return_to=; then failures go back
  // to that page rather than to /membership/.
  const returnTo = safeReturnPath(readCookie(request, RETURN_TO_COOKIE));
  const fail = (reason) => (returnTo ? bounceBack(url, returnTo, reason) : bounce(target, reason));

  const code = url.searchParams.get('code');
  if (!code) {
    // A refused consent screen comes back as ?error=… with no code at all.
    if (returnTo && url.searchParams.get('error')) return fail('access_denied');
    target.search = url.search;
    return Response.redirect(target.toString(), 308);
  }

  // Google reports user-facing failures (consent denied, closed window) here.
  const googleError = url.searchParams.get('error');
  if (googleError) return fail('access_denied');

  // CSRF: the state cookie is set when we send the user to Google. Treat a
  // missing cookie as acceptable (it expires after 5 minutes, and a slow
  // sign-in is not an attack) but a *mismatched* one as hostile.
  const cookieState = readCookie(request, 'google_oauth_state');
  if (cookieState && cookieState !== url.searchParams.get('state')) {
    return fail('state_mismatch');
  }

  let res;
  try {
    res = await fetch(`${url.origin}/api/auth/oauth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ authorization_code: code }),
    });
  } catch (e) {
    console.error('membership callback: exchange subrequest failed:', e && e.message);
    return fail('server_error');
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('membership callback: exchange rejected:', res.status, detail);
    return fail(detailToReason(detail));
  }

  // Hand the browser the session cookie the API just minted, then send it to
  // the real page. The authorization code never appears in a loadable URL.
  const landing = returnTo ? new URL(returnTo, url.origin) : target;
  landing.search = '?signed_in=1';
  const out = new Response(null, { status: 302, headers: { Location: landing.toString() } });
  for (const value of setCookies(res)) out.headers.append('Set-Cookie', value);
  // The one-shot state cookie has done its job.
  out.headers.append('Set-Cookie', 'google_oauth_state=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly');
  if (returnTo) out.headers.append('Set-Cookie', CLEAR_RETURN_TO_COOKIE);
  return out;
}

/**
 * POST /membership — Sign in with Apple's `form_post` callback.
 *
 * Apple does not redirect back with a query string; it POSTs a form to the
 * return URL from appleid.apple.com, which is a cross-site request. Nothing
 * static can receive that, so before this existed the Apple button led to a
 * dead end. The response asks for "code id_token", so the signed identity
 * token is right here in the body and no client secret is involved.
 */
export async function onRequestPost(context) {
  const { request } = context;
  const url = new URL(request.url);
  const target = new URL('/membership/', url.origin);

  let form;
  try {
    form = await request.formData();
  } catch {
    return bounce(target, 'bad_response');
  }

  if (form.get('error')) return bounce(target, 'access_denied');

  const idToken = form.get('id_token');
  const code = form.get('code');
  if (!idToken && !code) return bounce(target, 'no_identity_token');

  // The state cookie is SameSite=None precisely so it survives this cross-site
  // POST. If it is absent the request may simply have taken longer than five
  // minutes; only a mismatch is treated as hostile.
  const cookieState = readCookie(request, 'apple_oauth_state');
  if (cookieState && cookieState !== form.get('state')) {
    return bounce(target, 'state_mismatch');
  }

  const payload = { user: parseAppleUser(form.get('user')) };
  if (idToken) payload.id_token = idToken;
  else payload.authorization_code = code;

  let res;
  try {
    res = await fetch(`${url.origin}/api/auth/oauth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('membership callback: apple subrequest failed:', e && e.message);
    return bounce(target, 'server_error');
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error('membership callback: apple sign-in rejected:', res.status, detail);
    return bounce(target, /not fully configured/.test(detail) ? 'not_configured' : 'token_rejected');
  }

  target.search = '?signed_in=1';
  const out = new Response(null, { status: 302, headers: { Location: target.toString() } });
  for (const value of setCookies(res)) out.headers.append('Set-Cookie', value);
  out.headers.append('Set-Cookie', 'apple_oauth_state=; Path=/; Max-Age=0; SameSite=None; Secure; HttpOnly');
  return out;
}

/**
 * Apple sends the user's name exactly once, on the first authorisation, as a
 * JSON string in a form field. Every later sign-in omits it.
 */
function parseAppleUser(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function bounce(target, reason) {
  target.search = `?error=${encodeURIComponent(reason)}`;
  return Response.redirect(target.toString(), 302);
}

/** Failure with a return path: back to that page, and drop the cookie. */
function bounceBack(url, path, reason) {
  const location = new URL(path, url.origin);
  location.search = `?signin_error=${encodeURIComponent(reason)}`;
  return new Response(null, {
    status: 302,
    headers: [['Location', location.toString()], ['Set-Cookie', CLEAR_RETURN_TO_COOKIE]],
  });
}

/** Map Google's OAuth error codes onto the reasons the page knows how to explain. */
function detailToReason(body) {
  if (/invalid_grant/.test(body)) return 'code_replayed';
  if (/redirect_uri_mismatch/.test(body)) return 'not_configured';
  if (/invalid_client/.test(body)) return 'not_configured';
  return 'token_rejected';
}

function setCookies(res) {
  // getSetCookie() is the only correct way to read multiple Set-Cookie headers;
  // fall back to the single-header form on runtimes that lack it.
  if (typeof res.headers.getSetCookie === 'function') return res.headers.getSetCookie();
  const single = res.headers.get('set-cookie');
  return single ? [single] : [];
}

function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return '';
}
