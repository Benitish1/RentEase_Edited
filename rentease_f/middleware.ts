import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/tenant/:path*',
    '/landlord/:path*',
    '/admin/:path*',
    '/properties/:path*'
  ]
}
