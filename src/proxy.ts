import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth/session'

// Next 16 renamed middleware to "proxy" (same mechanism, Node.js runtime — so
// node:crypto in the session lib works here). Gates the pages: redirect to
// /login unless a valid signed session cookie is present.
//
// API routes are excluded from the matcher — they'd return an HTML redirect to
// a fetch() otherwise. Write routes enforce their own JSON 401 via
// requireSession(); reads stay public.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const user = verifySessionToken(token, Date.now())

  const isLogin = request.nextUrl.pathname === '/login'

  if (!user && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Gate pages only. Exclude /api (routes do their own JSON 401 / are public),
  // static assets, the image optimizer, favicon, and common image files.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
}
