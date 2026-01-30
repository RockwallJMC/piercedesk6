# Supabase Authentication Guide

**PierceDesk Authentication System**
**Last Updated:** 2026-01-27
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Client Setup](#client-setup)
4. [Authentication Providers](#authentication-providers)
5. [Session Management](#session-management)
6. [useSupabaseAuth Hook](#usesupbaseauth-hook)
7. [SupabaseAuthProvider](#supabaseauthprovider)
8. [Middleware](#middleware)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)

---

## Overview

PierceDesk uses **Supabase Auth** for authentication and user management. This replaces the previous NextAuth implementation to provide:

- **Seamless integration** with Supabase database and Row Level Security (RLS)
- **Cookie-based sessions** for Server-Side Rendering (SSR) compatibility
- **Built-in OAuth providers** (Google, Azure, GitHub, etc.)
- **Email/password authentication** with email verification
- **Multi-tenant architecture** with organization-based access control
- **Automatic session refresh** via middleware

### Why We Migrated from NextAuth

**Key advantages of Supabase Auth:**

1. **Native RLS integration** - User authentication directly ties into PostgreSQL RLS policies
2. **Simpler architecture** - No need for custom JWT handling or session storage
3. **Better SSR support** - Cookie management handled automatically via `@supabase/ssr`
4. **Built-in user management** - Leverages Supabase's `auth.users` table
5. **Unified security model** - Authentication, authorization, and data access in one system

---

## Architecture

### High-Level Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User Login/Signup                                            │
│     └─> useSupabaseAuth() hook                                  │
│         └─> signIn(email, password)                             │
│                                                                   │
│  2. SupabaseAuthProvider sets auth context                       │
│     └─> user, session, organizationId                           │
│                                                                   │
│  3. Components access auth state                                 │
│     └─> const { user, organizationId } = useSupabaseAuth()      │
│                                                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ HTTP Requests (with auth cookies)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Intercept all requests                                       │
│  2. Refresh Supabase session (getUser)                          │
│  3. Check route protection                                       │
│  4. Redirect if unauthorized                                     │
│  5. Update auth cookies                                          │
│                                                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER COMPONENTS / API                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. createClient() from server.js                                │
│  2. Access user session                                          │
│  3. Set organization context for RLS                             │
│  4. Execute queries (RLS filters data)                           │
│                                                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE (Cloud Database + Auth)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  • auth.users - User accounts                                    │
│  • public.user_profiles - Extended user data                     │
│  • public.organizations - Tenant organizations                   │
│  • public.organization_members - User-to-org mapping            │
│  • RLS Policies - Enforce multi-tenant data access              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **SupabaseAuthProvider** | React context for auth state | `src/providers/SupabaseAuthProvider.jsx` |
| **useSupabaseAuth** | Hook to consume auth context | `src/hooks/useSupabaseAuth.js` |
| **Client (Browser)** | Supabase client for client components | `src/lib/supabase/client.js` |
| **Server** | Supabase client for server components | `src/lib/supabase/server.js` |
| **Middleware** | Session refresh and route protection | `src/lib/supabase/middleware.js` |
| **RLS Helper** | Set organization context for RLS | `src/lib/supabase/rls-helper.js` |

---

## Client Setup

### Browser Client (Client Components)

For use in `'use client'` components:

```javascript
// src/lib/supabase/client.js
import { createBrowserClient } from '@supabase/ssr';

let browserClient = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return browserClient;
}
```

**Usage:**

```javascript
'use client';

import { createClient } from 'lib/supabase/client';

export default function MyComponent() {
  const supabase = createClient();

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
  };

  return <div>...</div>;
}
```

### Server Client (Server Components)

For use in Server Components and Route Handlers:

```javascript
// src/lib/supabase/server.js
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // Server Component context - cookies are read-only
          }
        },
      },
    }
  );
}
```

**Usage:**

```javascript
// Server Component
import { createClient } from 'lib/supabase/server';

export default async function ServerPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Query data (RLS automatically filters by organization)
  const { data: projects } = await supabase
    .from('projects')
    .select('*');

  return <div>{/* render data */}</div>;
}
```

### Environment Variables

Required environment variables in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Authentication Providers

### Email/Password Authentication

#### Sign Up

```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function SignUpForm() {
  const { signUp, loading } = useSupabaseAuth();

  const handleSignUp = async (email, password) => {
    try {
      const { data, error } = await signUp(email, password, {
        full_name: 'John Doe',
        company: 'Acme Inc'
      });

      if (error) throw error;

      // User will receive confirmation email
      alert('Check your email for confirmation link');
    } catch (error) {
      console.error('Sign up error:', error.message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSignUp(e.target.email.value, e.target.password.value);
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        Sign Up
      </button>
    </form>
  );
}
```

#### Sign In

```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function LoginForm() {
  const { signIn, loading } = useSupabaseAuth();

  const handleLogin = async (email, password) => {
    try {
      await signIn(email, password);
      // Provider handles redirect to dashboard or organization setup
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleLogin(e.target.email.value, e.target.password.value);
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={loading}>
        Sign In
      </button>
    </form>
  );
}
```

#### Sign Out

```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function LogoutButton() {
  const { signOut, loading } = useSupabaseAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Provider redirects to login page
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      Sign Out
    </button>
  );
}
```

### OAuth Providers (Google, Azure)

OAuth configuration is done in Supabase Dashboard under Authentication → Providers.

#### OAuth Sign In

```javascript
import { createClient } from 'lib/supabase/client';

function OAuthButtons() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) console.error('OAuth error:', error);
  };

  const handleAzureLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'email profile'
      }
    });

    if (error) console.error('OAuth error:', error);
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Sign in with Google</button>
      <button onClick={handleAzureLogin}>Sign in with Azure</button>
    </div>
  );
}
```

#### OAuth Callback Handler

Create an OAuth callback route at `src/app/auth/callback/route.js`:

```javascript
import { createClient } from 'lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard or organization setup
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
```

---

## Session Management

### Session Lifecycle

1. **Authentication** - User signs in (email/password or OAuth)
2. **Session Creation** - Supabase creates session with access token and refresh token
3. **Cookie Storage** - Session stored in HTTP-only cookies (`sb-access-token`, `sb-refresh-token`)
4. **Session Refresh** - Middleware automatically refreshes session on each request
5. **Session Expiry** - Access token expires after 1 hour, refresh token after 7 days (configurable)

### Cookie-Based Sessions

Supabase uses HTTP-only cookies for session management:

```
Set-Cookie: sb-access-token=...; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: sb-refresh-token=...; Path=/; HttpOnly; Secure; SameSite=Lax
```

**Benefits:**
- ✅ Secure (HTTP-only prevents XSS attacks)
- ✅ SSR-compatible (cookies sent with every request)
- ✅ Automatic refresh (handled by middleware)
- ✅ No localStorage needed (works without JavaScript)

### Checking User Session

#### Client Component

```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function ProfilePage() {
  const { user, session, loading } = useSupabaseAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
```

#### Server Component

```javascript
import { createClient } from 'lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/authentication/default/jwt/login');
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
    </div>
  );
}
```

---

## useSupabaseAuth Hook

The `useSupabaseAuth` hook provides access to authentication state and methods.

### API Reference

```typescript
interface UseSupabaseAuth {
  // State
  user: User | null;
  session: Session | null;
  loading: boolean;
  organizationId: string | null;

  // Methods
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, metadata?: object) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  setOrganization: (organizationId: string) => Promise<string>;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user object |
| `session` | `Session \| null` | Supabase session with tokens |
| `loading` | `boolean` | Loading state during auth operations |
| `organizationId` | `string \| null` | Current active organization ID |

### Methods

#### `signIn(email, password)`

Sign in user with email and password.

```javascript
const { signIn } = useSupabaseAuth();

try {
  const { data, error } = await signIn('user@example.com', 'password123');
  if (error) throw error;
  // Automatically redirects to dashboard or organization setup
} catch (error) {
  console.error('Login failed:', error.message);
}
```

#### `signUp(email, password, metadata)`

Register new user with optional metadata.

```javascript
const { signUp } = useSupabaseAuth();

try {
  const { data, error } = await signUp(
    'user@example.com',
    'password123',
    {
      full_name: 'John Doe',
      company: 'Acme Inc'
    }
  );

  if (error) throw error;
  // User receives confirmation email
} catch (error) {
  console.error('Sign up failed:', error.message);
}
```

#### `signOut()`

Sign out current user.

```javascript
const { signOut } = useSupabaseAuth();

try {
  await signOut();
  // Automatically redirects to login page
} catch (error) {
  console.error('Sign out failed:', error.message);
}
```

#### `setOrganization(organizationId)`

Change active organization for current user.

```javascript
const { setOrganization } = useSupabaseAuth();

try {
  await setOrganization('org-uuid-123');
  // Updates RLS context and triggers data refresh
} catch (error) {
  console.error('Failed to switch organization:', error.message);
}
```

### Usage Example

```javascript
// src/components/sections/authentications/LoginForm.jsx
'use client';

import { useState } from 'react';
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

export default function LoginForm() {
  const { signIn, loading } = useSupabaseAuth();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input name="email" type="email" required />
      <input name="password" type="password" required />

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

---

## SupabaseAuthProvider

The `SupabaseAuthProvider` manages authentication state for the entire application.

### Implementation

```javascript
// src/providers/SupabaseAuthProvider.jsx
'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'lib/supabase/client';
import { setOrganizationContext } from 'lib/supabase/rls-helper';

export const SupabaseAuthContext = createContext(undefined);

export function SupabaseAuthProvider({ children, initialSession = null }) {
  const router = useRouter();
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(!initialSession);
  const [organizationId, setOrganizationId] = useState(null);
  const supabase = createClient();

  // Auth state management logic...

  const value = {
    user,
    session,
    loading,
    organizationId,
    signIn,
    signUp,
    signOut,
    setOrganization,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
```

### Integration in Root Layout

```javascript
// src/app/layout.jsx
import { SupabaseAuthProvider } from 'providers/SupabaseAuthProvider';
import { createClient } from 'lib/supabase/server';

export default async function RootLayout({ children }) {
  const supabase = await createClient();

  // Get initial session for hydration
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body>
        <SupabaseAuthProvider initialSession={session}>
          {children}
        </SupabaseAuthProvider>
      </body>
    </html>
  );
}
```

### Features

1. **Session State Management** - Maintains user, session, loading, and organizationId
2. **Auth State Listener** - Listens for auth changes (login, logout, token refresh)
3. **Organization Fetching** - Automatically fetches user's organization on login
4. **Auto-Redirect** - Redirects to organization setup if user has no organization
5. **RLS Context** - Sets organization context for Row Level Security

---

## Middleware

Middleware handles session refresh and route protection.

### Implementation

```javascript
// src/lib/supabase/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export function createClient(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}

export async function updateSession(request) {
  const { supabase, response } = createClient(request);

  // Refresh session
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect to login if unauthorized
  if ((error || !user) && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/authentication/default/jwt/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if already authenticated
  if (user && pathname.startsWith('/authentication')) {
    const dashboardUrl = new URL('/dashboard', request.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}
```

### Middleware Configuration

```javascript
// middleware.js (root)
import { updateSession } from 'lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Protected Routes

Routes requiring authentication:

- `/dashboard/*`
- `/apps/*`
- `/pages/*`

Public routes (no authentication required):

- `/authentication/*`
- `/auth/callback`
- `/_next/*` (Next.js assets)
- `/favicon.ico`
- `/api/*`

---

## Security

### OWASP Compliance

PierceDesk authentication follows OWASP security best practices:

#### 1. Secure Session Management

✅ **HTTP-only cookies** - Prevents XSS attacks
✅ **Secure flag** - HTTPS-only transmission
✅ **SameSite=Lax** - CSRF protection
✅ **Automatic session refresh** - Minimizes token exposure

#### 2. Password Security

✅ **Strong password requirements** - Enforced by Supabase
✅ **Bcrypt hashing** - Password hashing by Supabase
✅ **Email verification** - Required for new accounts
✅ **Password reset flow** - Secure token-based reset

#### 3. Authentication Security

✅ **Rate limiting** - Built into Supabase Auth
✅ **JWT validation** - Automatic token verification
✅ **Refresh token rotation** - Enhanced security
✅ **Multi-factor authentication (MFA)** - Available via Supabase

#### 4. Input Validation

✅ **Email validation** - Format checking
✅ **SQL injection prevention** - Parameterized queries via Supabase client
✅ **XSS prevention** - React escapes by default

### Row Level Security (RLS)

Authentication integrates with PostgreSQL RLS for multi-tenant data access control.

**See:** [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md) for RLS details.

---

## Troubleshooting

### Common Issues

#### Issue: "User must be authenticated to set organization"

**Cause:** Attempting to call `setOrganization()` when not logged in.

**Solution:**
```javascript
const { user, setOrganization } = useSupabaseAuth();

if (user) {
  await setOrganization(orgId);
}
```

#### Issue: Session not persisting after login

**Cause:** Middleware not configured or cookies blocked.

**Solution:**
1. Verify middleware is set up in `middleware.js`
2. Check browser allows cookies from your domain
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

#### Issue: "Failed to set organization context"

**Cause:** RLS helper function not found or database error.

**Solution:**
1. Verify `set_config` function exists in database
2. Check Supabase connection
3. Review database logs in Supabase Dashboard

#### Issue: Redirect loop between login and dashboard

**Cause:** Middleware redirect logic conflict.

**Solution:**
1. Check middleware route matchers
2. Ensure `/auth/callback` is excluded from protection
3. Verify session is properly set after OAuth callback

### Debugging Tips

#### Enable Debug Logging

```javascript
// Client-side
const supabase = createClient();
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
});
```

#### Check Session Status

```javascript
// Client Component
const { user, session, loading } = useSupabaseAuth();

console.log('User:', user);
console.log('Session:', session);
console.log('Loading:', loading);
```

#### Verify Cookies

Open browser DevTools → Application → Cookies:
- `sb-access-token` should be present
- `sb-refresh-token` should be present
- Both should have `HttpOnly` and `Secure` flags

#### Check Supabase Logs

Supabase Dashboard → Logs → Auth Logs:
- View authentication attempts
- See token refresh events
- Identify errors

---

## Related Documentation

- [ORGANIZATION-SETUP.md](./ORGANIZATION-SETUP.md) - Multi-tenancy and organization management
- [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md) - Session lifecycle and RLS integration
- [MIGRATION-FROM-NEXTAUTH.md](./MIGRATION-FROM-NEXTAUTH.md) - Migration guide from NextAuth
- [Database RLS Verification](../../database-documentation/phase-g-rls-verification.md) - RLS test results

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Status:** ✅ Production Ready
