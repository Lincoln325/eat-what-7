import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  verifyCredentials,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth/session'

// POST /api/auth/login  { username, password }
// Verifies against the env credentials and, on success, sets a signed HTTP-only
// session cookie valid for one year.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!(await verifyCredentials(username, password))) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createSessionToken(username, Date.now())
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return Response.json({ ok: true })
}
