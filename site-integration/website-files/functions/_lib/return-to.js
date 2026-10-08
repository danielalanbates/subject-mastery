/**
 * Post-sign-in return path, shared by the Google OAuth start route
 * (functions/api/auth/[[path]].js) and its callback (functions/membership.js).
 *
 * A page elsewhere on the site (first user: /subjectmastery/) links to
 *   /api/auth/oauth/google?return_to=/subjectmastery/
 * and expects to come back there instead of /membership/. The path rides in a
 * short-lived HttpOnly cookie because Google's redirect_uri is fixed at
 * https://batesai.org/membership and cannot carry it.
 *
 * Only plain same-site paths are accepted, so this can never become an open
 * redirect: it must start with exactly one "/", use only [A-Za-z0-9/_.-], hold
 * no "//", backslash or "."/".." segment, stay within 200 characters, and
 * not point into /api/ or /cdn-cgi/ (a redirect onto an API route, e.g.
 * GET /api/auth/logout, would undo the sign-in that just happened). The value
 * is re-validated when read back, because a sibling *.batesai.org host could
 * plant a cookie too.
 *
 * Copyright (c) 2026 Daniel Bates / Bates LLC. All rights reserved.
 * help@batesai.org · https://batesai.org
 */

export const RETURN_TO_COOKIE = 'oauth_return_to';

// Ten minutes: Google's authorization code lives about that long anyway. If it
// lapses the member simply lands on /membership/, which is the old behaviour.
const RETURN_TO_MAX_AGE = 600;

const SAFE_PATH = /^\/[A-Za-z0-9/_.-]*$/;

/** Returns the path if it is a safe same-site return target, else null. */
export function safeReturnPath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 200) return null;
  if (!SAFE_PATH.test(value)) return null;
  if (value.includes('//') || value.includes('\\')) return null;
  // "." / ".." segments would let URL resolution walk "/x/../api/…" past the
  // prefix check below, so they are refused outright.
  if (value.split('/').some((seg) => seg === '.' || seg === '..')) return null;
  if (/^\/(api|cdn-cgi)(\/|$)/i.test(value)) return null;
  return value;
}

/** Set-Cookie value that remembers a (validated) return path. */
export function returnToCookie(path) {
  // The path alphabet is cookie-safe, so no encoding is needed.
  return `${RETURN_TO_COOKIE}=${path}; Path=/; Max-Age=${RETURN_TO_MAX_AGE}; SameSite=Lax; Secure; HttpOnly`;
}

/** Set-Cookie value that removes it. */
export const CLEAR_RETURN_TO_COOKIE = `${RETURN_TO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly`;
