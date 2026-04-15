import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

const ROLE_PATHS: Record<string, string> = {
  customer:   '/dashboard/customer',
  admin:      '/dashboard/admin',
  support:    '/dashboard/support',
  technician: '/dashboard/technician',
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth_token')?.value
  const role  = request.cookies.get('auth_role')?.value

  // No token = redirect to login
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // If just /dashboard, redirect to their role dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    const homeRoute = ROLE_PATHS[role ?? 'customer']
    return NextResponse.redirect(new URL(homeRoute, request.url))
  }

  // Allow all /dashboard/* paths if they have a token
  if (pathname.startsWith('/dashboard/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}