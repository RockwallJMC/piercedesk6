import { createServerClient } from '@supabase/ssr'

/**
 * Create a Supabase client for API routes that receive Bearer tokens.
 * This client uses the Authorization header for RLS instead of cookies.
 *
 * Usage in API routes:
 *   const supabase = createApiClient(request)
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // Now RLS will use this user for all queries
 */
export function createApiClient(request) {
  const authHeader = request.headers.get('authorization')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: authHeader || '',
        },
      },
      cookies: {
        // Empty cookie implementation for API routes
        // These routes use Bearer tokens, not cookies
        getAll() {
          return []
        },
        setAll() {
          // No-op for API routes
        },
      },
    }
  )
}
