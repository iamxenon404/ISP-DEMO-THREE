import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

const ROLE_PATHS: Record<string, string> = {
  customer:   '/dashboard/customer',
  admin:      '/dashboard/admin',
  support:    '/dashboard/support',
  technician: '/dashboard/technician',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value
  const role  = request.cookies.get('auth_role')?.value

  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return NextResponse.redirect(new URL(ROLE_PATHS[role ?? ''] ?? '/login', request.url))
  }

  if (pathname.startsWith('/dashboard/') && role) {
    const correct = ROLE_PATHS[role]
    if (correct && !pathname.startsWith(correct)) {
      return NextResponse.redirect(new URL(correct, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'], 
}