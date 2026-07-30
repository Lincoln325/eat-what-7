import 'server-only'
import { createHmac, timingSafeEqual, scrypt as scryptCb } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb)

const SESSION_SECRET = process.env.SESSION_SECRET!
const AUTH_USERNAME = process.env.AUTH_USERNAME!
// scrypt hash of the real password, stored as "salt:hash" (both hex). The
// plaintext password never lives in env — generate with scripts/hash-password.
const AUTH_PASSWORD_HASH = process.env.AUTH_PASSWORD_HASH!

export const SESSION_COOKIE = 'eatwhat_session'
// One year — the user just re-enters the password when it lapses (no logout UI).
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365

// --- Password verification (scrypt, constant-time) ---------------------------

// Verify a username+password against the env credentials. Both comparisons are
// constant-time so a wrong username can't be distinguished by timing.
export async function verifyCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const [saltHex, hashHex] = (AUTH_PASSWORD_HASH ?? '').split(':')
  if (!saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const derived = (await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length)) as Buffer

  const userOk = safeEqualStr(username, AUTH_USERNAME)
  const passOk = expected.length === derived.length && timingSafeEqual(expected, derived)
  return userOk && passOk
}

function safeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

// --- Signed session token ("<payloadB64>.<hmac>") ----------------------------

interface SessionPayload {
  u: string // username
  exp: number // unix seconds
}

function sign(data: string): string {
  return createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
}

// Create a signed session token valid for SESSION_MAX_AGE seconds.
export function createSessionToken(username: string, nowMs: number): string {
  const payload: SessionPayload = {
    u: username,
    exp: Math.floor(nowMs / 1000) + SESSION_MAX_AGE,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${body}.${sign(body)}`
}

// Verify a token's signature and expiry. Returns the username or null. Signature
// is checked in constant time before we trust anything in the payload.
export function verifySessionToken(token: string | undefined, nowMs: number): string | null {
  if (!token) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null

  const body = token.slice(0, dot)
  const providedSig = token.slice(dot + 1)
  const expectedSig = sign(body)

  const a = Buffer.from(providedSig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < nowMs) return null
    return payload.u
  } catch {
    return null
  }
}
