import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect the admin page (root)
  if (pathname === '/') {
    const auth = request.cookies.get('admin_auth')?.value
    if (auth !== 'karan88admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login'],
}
