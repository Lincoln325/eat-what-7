import 'server-only'
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session'

// True when the request carries a valid session cookie. Write API routes call
// this to return a JSON 401 (the proxy only guards pages, not /api).
export async function hasValidSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return verifySessionToken(token, Date.now()) !== null
}
