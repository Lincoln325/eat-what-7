import { describe, it, expect, beforeAll } from 'vitest'
import { scryptSync, randomBytes } from 'node:crypto'

// The session module reads env at import time, so set credentials first.
const PASSWORD = 'correct-horse-battery'
beforeAll(() => {
  const salt = randomBytes(16)
  const hash = scryptSync(PASSWORD, salt, 64)
  process.env.SESSION_SECRET = 'test-secret-please-ignore'
  process.env.AUTH_USERNAME = 'alice'
  process.env.AUTH_PASSWORD_HASH = `${salt.toString('hex')}:${hash.toString('hex')}`
})

// Imported dynamically after env is set.
const load = async () => import('./session')

describe('verifyCredentials', () => {
  it('accepts the right username + password', async () => {
    const { verifyCredentials } = await load()
    expect(await verifyCredentials('alice', PASSWORD)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const { verifyCredentials } = await load()
    expect(await verifyCredentials('alice', 'wrong')).toBe(false)
  })

  it('rejects a wrong username', async () => {
    const { verifyCredentials } = await load()
    expect(await verifyCredentials('bob', PASSWORD)).toBe(false)
  })
})

describe('session token', () => {
  const NOW = 1_700_000_000_000

  it('round-trips a valid token', async () => {
    const { createSessionToken, verifySessionToken } = await load()
    const token = createSessionToken('alice', NOW)
    expect(verifySessionToken(token, NOW)).toBe('alice')
  })

  it('rejects an expired token', async () => {
    const { createSessionToken, verifySessionToken, SESSION_MAX_AGE } = await load()
    const token = createSessionToken('alice', NOW)
    const afterExpiry = NOW + (SESSION_MAX_AGE + 1) * 1000
    expect(verifySessionToken(token, afterExpiry)).toBeNull()
  })

  it('rejects a tampered payload', async () => {
    const { createSessionToken, verifySessionToken } = await load()
    const token = createSessionToken('alice', NOW)
    const [, sig] = token.split('.')
    const forged = `${Buffer.from(JSON.stringify({ u: 'mallory', exp: 9_999_999_999 })).toString('base64url')}.${sig}`
    expect(verifySessionToken(forged, NOW)).toBeNull()
  })

  it('rejects garbage and undefined', async () => {
    const { verifySessionToken } = await load()
    expect(verifySessionToken(undefined, NOW)).toBeNull()
    expect(verifySessionToken('not-a-token', NOW)).toBeNull()
    expect(verifySessionToken('a.b.c', NOW)).toBeNull()
  })
})
