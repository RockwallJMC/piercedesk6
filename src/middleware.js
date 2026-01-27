import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js Middleware for Supabase Auth
 * Protects routes and manages authentication state
 */
export async function middleware(request) {
  return await updateSession(request);
}

/**
 * Matcher configuration for protected routes
 * Routes matching these patterns will run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - authentication routes (public)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export default middleware;
