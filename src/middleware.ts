import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Protected user routes
    const userProtectedPaths = ['/dashboard', '/predictions', '/matches'];
    const isUserProtected = userProtectedPaths.some(path => pathname.startsWith(path));

    // Protected admin routes
    const isAdminPath = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');

    // Redirect unauthenticated users from protected routes
    if (isUserProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect non-admin users from admin routes
    if (isAdminPath && (!token || !token.isAdmin)) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Redirect authenticated users from auth pages
    if ((pathname === '/login' || pathname === '/signup') && token && !token.isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/predictions/:path*',
        '/matches/:path*',
        '/admin/:path*',
        '/login',
        '/signup',
    ],
};
