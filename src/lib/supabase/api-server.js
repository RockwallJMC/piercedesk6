import { createServerClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for API Route Handlers.
 *
 * Supports both:
 * - Bearer token auth via Authorization header (used by API tests and axiosInstance)
 * - Cookie-based auth via Supabase session cookies (used by browser flows)
 *
 * @param {Request} request - The Next.js request object
 * @returns {SupabaseClient} Supabase client instance
 */
export function createApiClient(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  const authHeader = request.headers.get('authorization') || ''

  // Extract cookies from the request headers
  const cookieHeader = request.headers.get('cookie') || ''

  // Parse cookies into a simple key-value store
  const cookieStore = {}
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookieStore[name] = rest.join('=')
    }
  })

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
    cookies: {
      get(name) {
        return cookieStore[name]
      },
      set() {
        // API routes handle cookies via response headers
        // Cookie setting happens via NextResponse.cookies
      },
      remove() {
        // API routes handle cookies via response headers
      },
    },
  })
}
