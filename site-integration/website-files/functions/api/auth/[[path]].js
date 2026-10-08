/**
 * BatesAI Membership — Auth Router
 *
 * Endpoints (all under /api/auth/):
 *   POST  login            email + password
 *   POST  register         email + password + name
 *   GET   verify           Bearer token -> user (used by every client on launch)
 *   POST  logout
 *   GET   oauth/google     browser redirect to Google
 *   POST  oauth/google     browser callback: authorization_code | id_token
 *   GET   oauth/apple      browser redirect to Apple
 *   POST  oauth/apple      browser callback: authorization_code | id_token
 *   POST  native/apple     native macOS/iOS Sign in with Apple (identity token)
 *   POST  native/google    native Google Sign-In (id_token)
 *
 * GET oauth/google also takes an optional ?return_to=<same-site path>; see
 * functions/_lib/return-to.js. Without it nothing about the flow changes.
 *
 * SECURITY NOTE: every path that accepts a provider id_token verifies the token's
 * RS256 signature against the provider's published JWKS, plus issuer, audience and
 * expiry. A previous revision of this file base64-decoded the token payload without
 * checking the signature, which let anyone mint an arbitrary identity token and log
 * in as any user. Do not reintroduce an unverified decode.
 */

import {
  RETURN_TO_COOKIE, CLEAR_RETURN_TO_COOKIE, safeReturnPath, returnToCookie,
} from '../../_lib/return-to.js';

const APPLE_ISSUER = 'https://appleid.apple.com';
const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // matches the website's batesai_session cookie

export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path || [];
  const origin = request.headers.get('Origin');

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(env, origin) });
  }

  const url = new URL(request.url);
  const endpoint = path[0] || '';

  try {
    switch (endpoint) {
      case 'login':
        return withCors(await handleLogin(request, env), env, origin);
      case 'register':
        return withCors(await handleRegister(request, env), env, origin);
      case 'verify':
        return withCors(await handleVerify(request, env), env, origin);
      case 'me':
        return withCors(await handleMe(request, env), env, origin);
      case 'logout':
        return withCors(await handleLogout(request, env), env, origin);
      case 'oauth':
        return withCors(await handleOAuth(request, env, url, path), env, origin);
      case 'native':
        return withCors(await handleNative(request, env, path), env, origin);
      case 'account':
        return withCors(await handleAccount(request, env, path), env, origin);
      default:
        return withCors(json({ error: 'Unknown endpoint' }, 404), env, origin);
    }
  } catch (error) {
    console.error('Auth API error:', error && error.stack ? error.stack : error);
    return withCors(json({ error: 'Internal server error' }, 500), env, origin);
  }
}

/* ------------------------------------------------------------------ */
/* Native sign-in (macOS / iOS app)                                    */
/* ------------------------------------------------------------------ */

/**
 * The native apps do Sign in with Apple on-device via AuthenticationServices,
 * which hands back an identity token (a JWT signed by Apple). We verify it here
 * and exchange it for a BatesAI session token. No client secret is involved,
 * which is why signature verification is the only thing standing between this
 * endpoint and a full account takeover.
 */
async function handleNative(request, env, path) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const provider = path[1] || '';
  const body = await request.json().catch(() => ({}));

  let claims;
  let providerName;

  if (provider === 'apple') {
    const { identity_token: identityToken, nonce, full_name: fullName } = body;
    if (!identityToken) return json({ error: 'identity_token is required' }, 400);

    claims = await verifyProviderToken(identityToken, {
      jwksUrl: APPLE_JWKS_URL,
      issuers: [APPLE_ISSUER],
      audiences: appleAudiences(env),
    });
    if (!claims) return json({ error: 'Invalid Apple identity token' }, 401);

    // Apple echoes back the nonce we sent. If the client supplied one, it must
    // match either verbatim (client sent the hashed nonce, correct behaviour) or
    // after hashing (app build <=6 sent the RAW nonce while setting the SHA-256
    // on the Apple request, which made every real-device sign-in 401 here).
    if (nonce && claims.nonce && claims.nonce !== nonce && claims.nonce !== (await sha256Hex(nonce))) {
      return json({ error: 'Nonce mismatch' }, 401);
    }

    providerName = 'apple';
    claims.__name = formatAppleName(fullName);
  } else if (provider === 'google') {
    const { id_token: idToken } = body;
    if (!idToken) return json({ error: 'id_token is required' }, 400);

    claims = await verifyProviderToken(idToken, {
      jwksUrl: GOOGLE_JWKS_URL,
      issuers: GOOGLE_ISSUERS,
      audiences: googleAudiences(env),
    });
    if (!claims) return json({ error: 'Invalid Google id token' }, 401);

    providerName = 'google';
    claims.__name = claims.name;
  } else {
    return json({ error: 'Unknown provider' }, 404);
  }

  const user = await upsertOAuthUser(env, {
    provider: providerName,
    sub: claims.sub,
    // Apple only returns an email on the very first authorization, and it may be
    // a private relay address. Fall back to a stable per-sub placeholder so the
    // NOT NULL constraint holds and repeat logins still resolve to one account.
    email: claims.email || `${claims.sub}@${providerName}.local`,
    name: claims.__name,
    avatarUrl: claims.picture || null,
    emailVerified: claims.email_verified === true || claims.email_verified === 'true',
  });

  const token = await issueSession(env, user);
  return json({ success: true, token, user: publicUser(user) }, 200);
}

function appleAudiences(env) {
  // Web uses the Services ID; the native apps use their bundle identifiers.
  const configured = [env.OAUTH_APPLE_CLIENT_ID, env.APPLE_CLIENT_ID, env.APPLE_NATIVE_CLIENT_IDS];
  const list = configured.filter(Boolean).flatMap((v) => String(v).split(','));
  if (!list.length) list.push('org.batesai.membership');
  // The Endgame Fitness iOS bundle id. The older guess is kept as well: the
  // auth code live on production since 2026-09-26 accepts it, and dropping it
  // here could only ever turn a working sign-in into a 401.
  list.push('com.batesllc.EndgameFitnessMobile', 'org.batesai.endgamefitness');
  return [...new Set(list.map((s) => s.trim()).filter(Boolean))];
}

function googleAudiences(env) {
  const configured = [env.OAUTH_GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_ID, env.GOOGLE_NATIVE_CLIENT_IDS];
  const list = configured.filter(Boolean).flatMap((v) => String(v).split(','));
  return [...new Set(list.map((s) => s.trim()).filter(Boolean))];
}

function formatAppleName(fullName) {
  // Apple sends the display name exactly once, at first authorization.
  if (!fullName) return null;
  if (typeof fullName === 'string') return fullName.trim() || null;
  const given = fullName.givenName || fullName.firstName || '';
  const family = fullName.familyName || fullName.lastName || '';
  return `${given} ${family}`.trim() || null;
}

/* ------------------------------------------------------------------ */
/* Provider token verification (RS256 against published JWKS)          */
/* ------------------------------------------------------------------ */

const jwksCache = new Map(); // url -> { keys, fetchedAt }
const JWKS_TTL_MS = 60 * 60 * 1000;

async function fetchJwks(url) {
  const cached = jwksCache.get(url);
  if (cached && Date.now() - cached.fetchedAt < JWKS_TTL_MS) return cached.keys;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`JWKS fetch failed for ${url}: ${res.status}`);
  const data = await res.json();
  const keys = data.keys || [];
  jwksCache.set(url, { keys, fetchedAt: Date.now() });
  return keys;
}

async function verifyProviderToken(token, { jwksUrl, issuers, audiences }) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    if (header.alg !== 'RS256') return null;

    let keys = await fetchJwks(jwksUrl);
    let jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) {
      // Providers rotate signing keys; bust the cache once before giving up.
      jwksCache.delete(jwksUrl);
      keys = await fetchJwks(jwksUrl);
      jwk = keys.find((k) => k.kid === header.kid);
    }
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      'jwk',
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlToBytes(parts[2]);
    const signedData = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, signedData);
    if (!valid) return null;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) return null;
    if (typeof payload.iat === 'number' && payload.iat > now + 300) return null; // clock skew guard
    if (!issuers.includes(payload.iss)) return null;

    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (audiences.length && !aud.some((a) => audiences.includes(a))) return null;
    if (!payload.sub) return null;

    return payload;
  } catch (e) {
    console.error('Provider token verification failed:', e && e.message);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Shared user + session helpers                                       */
/* ------------------------------------------------------------------ */

async function upsertOAuthUser(env, { provider, sub, email, name, avatarUrl }) {
  const now = Math.floor(Date.now() / 1000);
  const normalizedEmail = String(email).toLowerCase();

  // Match on (provider, sub) first — it is the only stable identifier Apple gives
  // us. Email can change or be a rotating private-relay address.
  let user = await env.DB.prepare(
    'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?'
  ).bind(provider, sub).first();

  if (!user) {
    user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(normalizedEmail).first();
    if (user) {
      // Existing password account signing in with the same email via OAuth: link them.
      await env.DB.prepare(
        'UPDATE users SET oauth_provider = ?, oauth_id = ?, updated_at = ? WHERE id = ?'
      ).bind(provider, sub, now, user.id).run();
      user.oauth_provider = provider;
      user.oauth_id = sub;
    }
  }

  if (!user) {
    const userId = crypto.randomUUID();
    const displayName = name || normalizedEmail.split('@')[0];
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, avatar_url, oauth_provider, oauth_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, normalizedEmail, '', displayName, avatarUrl, provider, sub, now, now).run();

    await ensureFitnessProfile(env, userId, displayName);

    user = {
      id: userId,
      email: normalizedEmail,
      name: displayName,
      avatar_url: avatarUrl,
      oauth_provider: provider,
      oauth_id: sub,
    };
  } else {
    // Backfill a name/avatar if we have one now and didn't before.
    if ((name && !user.name) || (avatarUrl && !user.avatar_url)) {
      await env.DB.prepare('UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?')
        .bind(name || user.name, avatarUrl || user.avatar_url, now, user.id)
        .run();
      user.name = name || user.name;
      user.avatar_url = avatarUrl || user.avatar_url;
    }
    await ensureFitnessProfile(env, user.id, user.name);
  }

  return user;
}

async function ensureFitnessProfile(env, userId, displayName) {
  try {
    await env.DB.prepare(
      `INSERT INTO fitness_profiles (user_id, display_name, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO NOTHING`
    ).bind(userId, displayName || 'Athlete', Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)).run();
  } catch (e) {
    // Table may not exist yet on a partially-migrated database. Sign-in must not
    // fail because the fitness schema is behind.
    console.error('ensureFitnessProfile skipped:', e && e.message);
  }
}

/**
 * Sessions are opaque random tokens; only their SHA-256 is stored, and the
 * same `sessions` table backs the website's batesai_session cookie. So a token
 * minted here works for the web (as a cookie) and a web cookie works here (as a
 * Bearer token) — one membership, one session store, no signing secret.
 */
async function issueSession(env, user) {
  const token = base64UrlFromBytes(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), user.id, await sha256Hex(token), expiresAt).run();
  return token;
}

/**
 * GET /api/auth/me — the membership page's session probe. Shape matches the
 * page script: { signedIn, user: { name, email, tier, memberSince } }.
 */
async function handleMe(request, env) {
  const user = await sessionUser(request, env);
  if (!user) return json({ signedIn: false }, 200);
  const created = await env.DB.prepare('SELECT created_at FROM users WHERE id = ?')
    .bind(user.id).first();
  return json({
    signedIn: true,
    user: {
      name: user.name,
      email: user.email,
      tier: user.membership_tier || 'free',
      memberSince: created?.created_at || null,
    },
  }, 200);
}

/** Bearer token (or website cookie) -> user row, or null. */
export async function sessionUser(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) token = readCookie(request, 'batesai_session') || '';
  if (!token) token = new URL(request.url).searchParams.get('token') || '';
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.avatar_url, u.membership_tier, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`
  ).bind(await sha256Hex(token), Math.floor(Date.now() / 1000)).first();
  return row || null;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return null;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url || null,
    membership: user.membership_tier || user.membership || 'free',
  };
}

/* ------------------------------------------------------------------ */
/* Account deletion (App Store Review 5.1.1(v): in-app, no web detour)  */
/* ------------------------------------------------------------------ */

/**
 * DELETE /api/auth/account  (Bearer token or website cookie)
 *
 * Removes the membership row. Every fitness table references users(id) with
 * ON DELETE CASCADE, so profile, sessions, workouts, XP, feed, friendships,
 * guild membership, talents, quests and achievements all go with it. A guild
 * the user owned is handed to its longest-serving member first so the other
 * members are not orphaned. The response body is the same whether or not the
 * row existed, so a replayed request is harmless.
 */
async function handleAccount(request, env, path) {
  const action = path[1] || '';
  if (request.method === 'DELETE' || (request.method === 'POST' && action === 'delete')) {
    const user = await sessionUser(request, env);
    if (!user) return json({ error: 'Not signed in' }, 401);

    const ownedGuilds = await env.DB.prepare('SELECT id FROM guilds WHERE owner_id = ?')
      .bind(user.id).all();
    for (const guild of ownedGuilds.results || []) {
      const heir = await env.DB.prepare(
        'SELECT user_id FROM guild_members WHERE guild_id = ? AND user_id != ? ORDER BY joined_at ASC LIMIT 1'
      ).bind(guild.id, user.id).first();
      if (heir) {
        await env.DB.batch([
          env.DB.prepare("UPDATE guild_members SET role = 'owner' WHERE guild_id = ? AND user_id = ?")
            .bind(guild.id, heir.user_id),
          env.DB.prepare('UPDATE guilds SET owner_id = ? WHERE id = ?').bind(heir.user_id, guild.id),
        ]);
      } else {
        await env.DB.prepare('DELETE FROM guilds WHERE id = ?').bind(guild.id).run();
      }
    }

    // Tables that predate ON DELETE CASCADE on this database are cleared
    // explicitly; the rest cascade from the users row. Every table named here
    // must exist, or the whole batch fails and nothing is deleted — so a new
    // entry's migration (e.g. migrations/0001_sm_progress.sql, 0002_…) ships first.
    const explicit = [
      'sessions', 'fitness_profiles', 'workout_sessions', 'xp_transactions', 'activity_feed',
      'activity_reactions', 'talents', 'achievements', 'quests', 'personal_records',
      'guild_members', 'challenge_participants', 'subscriptions', 'user_settings',
      'workout_programs', 'programs', 'meso_cycles', 'progress_metrics', 'talent_unlocks',
      'dm_sync', 'sm_progress', 'sm_profile', 'sm_plan',
    ];
    const statements = explicit.map((table) =>
      env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(user.id)
    );
    statements.push(
      env.DB.prepare('DELETE FROM friendships WHERE user_low = ? OR user_high = ?').bind(user.id, user.id),
      env.DB.prepare('DELETE FROM challenges WHERE creator_id = ? OR opponent_id = ?').bind(user.id, user.id),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id)
    );
    // batch() runs as one transaction; a failure in any statement rolls back
    // and the account stays intact rather than half-deleted.
    await env.DB.batch(statements);
    return json({ deleted: true }, 200);
  }
  return json({ error: 'Method not allowed' }, 405);
}

/* ------------------------------------------------------------------ */
/* Email + password                                                    */
/* ------------------------------------------------------------------ */

async function handleLogin(request, env) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return json({ error: 'Email and password are required' }, 400);

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(String(email).toLowerCase())
    .first();

  if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
    return json({ error: 'Invalid email or password' }, 401);
  }

  await ensureFitnessProfile(env, user.id, user.name);
  const token = await issueSession(env, user);
  return json({ message: 'Login successful', token, user: publicUser(user) }, 200);
}

async function handleRegister(request, env) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const { email, password, name } = await request.json().catch(() => ({}));
  if (!email || !password) return json({ error: 'Email and password are required' }, 400);
  if (String(password).length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

  const normalizedEmail = String(email).toLowerCase();
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(normalizedEmail).first();
  if (existing) return json({ error: 'An account with that email already exists' }, 409);

  const now = Math.floor(Date.now() / 1000);
  const userId = crypto.randomUUID();
  const displayName = name || normalizedEmail.split('@')[0];
  const passwordHash = await hashPassword(password, generateSalt());

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(userId, normalizedEmail, passwordHash, displayName, now, now).run();

  await ensureFitnessProfile(env, userId, displayName);

  const user = { id: userId, email: normalizedEmail, name: displayName };
  const token = await issueSession(env, user);
  return json({ message: 'Account created', token, user: publicUser(user) }, 201);
}

async function handleVerify(request, env) {
  const user = await sessionUser(request, env);
  if (!user) return json({ valid: false, error: 'Invalid or missing token' }, 401);
  return json({ valid: true, user: publicUser(user) }, 200);
}

async function handleLogout(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : readCookie(request, 'batesai_session');
  if (token) {
    try {
      await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
    } catch (e) {
      console.error('Logout cleanup failed:', e && e.message);
    }
  }
  return json({ message: 'Logged out successfully' }, 200);
}

/* ------------------------------------------------------------------ */
/* Browser OAuth (redirect + callback)                                 */
/* ------------------------------------------------------------------ */

async function handleOAuth(request, env, url, path) {
  const provider = path[1] || '';

  if (provider === 'google') {
    if (request.method === 'GET') {
      const clientId = googleAudiences(env)[0];
      if (!clientId) return json({ error: 'Google OAuth is not configured' }, 500);
      const state = crypto.randomUUID();
      const redirectUri = `${url.origin}/membership`;
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code` +
        `&scope=${encodeURIComponent('email profile openid')}&state=${state}` +
        `&access_type=offline&prompt=select_account`;
      const headers = new Headers({ Location: authUrl });
      headers.append('Set-Cookie', `google_oauth_state=${state}; Path=/; Max-Age=300; SameSite=Lax; Secure; HttpOnly`);
      // Optional landing page for after the /membership callback (e.g.
      // /subjectmastery/). An invalid value is ignored, never echoed. A plain
      // sign-in clears any leftover one, so it cannot hijack this trip.
      const returnTo = safeReturnPath(url.searchParams.get('return_to'));
      if (returnTo) headers.append('Set-Cookie', returnToCookie(returnTo));
      else if (readCookie(request, RETURN_TO_COOKIE) !== null) headers.append('Set-Cookie', CLEAR_RETURN_TO_COOKIE);
      return new Response(null, { status: 302, headers });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      let idToken = body.id_token;

      if (!idToken && body.authorization_code) {
        const clientId = googleAudiences(env)[0];
        const clientSecret = env.OAUTH_GOOGLE_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) return json({ error: 'Google OAuth is not fully configured' }, 500);

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: body.authorization_code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: `${url.origin}/membership`,
            grant_type: 'authorization_code',
          }),
        });
        if (!tokenRes.ok) {
          // Surface Google's own error code. These are diagnostic OAuth codes
          // (invalid_client, invalid_grant, redirect_uri_mismatch), not
          // secrets, and without them a failed sign-in is unfixable from the
          // client side — the page could only ever say "it didn't work".
          const raw = await tokenRes.text();
          console.error('Google token exchange failed:', raw);
          let detail = null;
          let code = null;
          try {
            const parsed = JSON.parse(raw);
            detail = parsed.error_description || parsed.error || null;
            code = parsed.error || null;
          } catch { /* non-JSON body: fall through with no detail */ }
          // `code` is the machine-readable form (invalid_grant, …). The
          // /membership callback keys its user-facing message off it, so it
          // must survive separately from the prose description.
          return json({ error: 'Failed to exchange authorization code', detail, code }, 400);
        }
        idToken = (await tokenRes.json()).id_token;
      }

      if (!idToken) return json({ error: 'No Google credential supplied' }, 400);

      const claims = await verifyProviderToken(idToken, {
        jwksUrl: GOOGLE_JWKS_URL,
        issuers: GOOGLE_ISSUERS,
        audiences: googleAudiences(env),
      });
      if (!claims) return json({ error: 'Invalid Google id token' }, 401);

      const user = await upsertOAuthUser(env, {
        provider: 'google',
        sub: claims.sub,
        email: claims.email || `${claims.sub}@google.local`,
        name: claims.name,
        avatarUrl: claims.picture || null,
      });
      const token = await issueSession(env, user);
      // Also set the website's session cookie: the membership page exchanges
      // Google's ?code via fetch and then relies on /api/auth/me seeing it.
      const res = json({ success: true, token, user: publicUser(user) }, 200);
      res.headers.append('Set-Cookie',
        `batesai_session=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax; Secure; HttpOnly`);
      return res;
    }
  }

  if (provider === 'apple') {
    if (request.method === 'GET') {
      const clientId = env.OAUTH_APPLE_CLIENT_ID || env.APPLE_CLIENT_ID || 'org.batesai.membership';
      const state = crypto.randomUUID();
      const redirectUri = `${url.origin}/membership`;
      const authUrl =
        `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${encodeURIComponent('code id_token')}` +
        // "code id_token" so Apple signs an identity token into the callback
        // itself. Verifying that against Apple's public keys needs no client
        // secret, which means the .p8 private key never has to live in Pages —
        // see wrangler.toml. Asking for "code" alone would force a secret we
        // deliberately do not hold.
        `&scope=${encodeURIComponent('email name')}&state=${state}` +
        `&response_mode=form_post`;
      return new Response(null, {
        status: 302,
        headers: {
          Location: authUrl,
          // SameSite=None, unlike every other cookie here: Apple returns via a
          // cross-site POST, and a Lax cookie is not sent on one. Without this
          // the state check on the way back can never succeed.
          'Set-Cookie': `apple_oauth_state=${state}; Path=/; Max-Age=300; SameSite=None; Secure; HttpOnly`,
        },
      });
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      let idToken = body.id_token;

      if (!idToken && body.authorization_code) {
        const clientId = env.OAUTH_APPLE_CLIENT_ID || env.APPLE_CLIENT_ID;
        const clientSecret = env.OAUTH_APPLE_CLIENT_SECRET || env.APPLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) return json({ error: 'Apple OAuth is not fully configured' }, 500);

        const tokenRes = await fetch('https://appleid.apple.com/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: body.authorization_code,
            redirect_uri: `${url.origin}/membership`,
            client_id: clientId,
            client_secret: clientSecret,
          }),
        });
        if (!tokenRes.ok) {
          console.error('Apple token exchange failed:', await tokenRes.text());
          return json({ error: 'Failed to exchange authorization code' }, 400);
        }
        idToken = (await tokenRes.json()).id_token;
      }

      if (!idToken) return json({ error: 'No Apple credential supplied' }, 400);

      const claims = await verifyProviderToken(idToken, {
        jwksUrl: APPLE_JWKS_URL,
        issuers: [APPLE_ISSUER],
        audiences: appleAudiences(env),
      });
      if (!claims) return json({ error: 'Invalid Apple id token' }, 401);

      const user = await upsertOAuthUser(env, {
        provider: 'apple',
        sub: claims.sub,
        email: claims.email || `${claims.sub}@apple.local`,
        name: formatAppleName(body.user),
        avatarUrl: null,
      });
      const token = await issueSession(env, user);
      // Same as Google: the /membership callback lifts this cookie onto its own
      // redirect, and the app's sign-in webview scrapes it from the cookie jar.
      const res = json({ success: true, token, user: publicUser(user) }, 200);
      res.headers.append('Set-Cookie',
        `batesai_session=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax; Secure; HttpOnly`);
      return res;
    }
  }

  return json({ error: 'Unknown OAuth provider' }, 404);
}

/* ------------------------------------------------------------------ */
/* JWT / crypto utilities                                              */
/* ------------------------------------------------------------------ */

function base64UrlFromBytes(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str) {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function base64UrlDecode(str) {
  return new TextDecoder().decode(base64UrlToBytes(str));
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return toHex(new Uint8Array(digest));
}

function toHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPassword(password, salt) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + salt));
  return `$sha256$${salt}$${toHex(new Uint8Array(digest))}`;
}

async function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split('$');
    if (parts.length === 4 && parts[1] === 'sha256') {
      return (await hashPassword(password, parts[2])) === storedHash;
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return toHex(new Uint8Array(digest)) === storedHash;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                        */
/* ------------------------------------------------------------------ */

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function corsHeaders(env, origin) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  // Native apps send no Origin header at all; browsers must match the allowlist.
  const value = !allowed.length ? '*' : allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': value,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

function withCors(response, env, origin) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(env, origin)).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
