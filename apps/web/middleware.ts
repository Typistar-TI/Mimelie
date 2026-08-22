import { NextResponse, type NextRequest } from 'next/server';
export function middleware(request: NextRequest) { if (!request.cookies.has('mimelie_session')) return NextResponse.redirect(new URL('/entrar?next=/admin', request.url)); return NextResponse.next(); }
export const config = { matcher: ['/admin/:path*'] };
