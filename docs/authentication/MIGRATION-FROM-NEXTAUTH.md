# Migration from NextAuth to Supabase Auth

**PierceDesk Authentication Migration Guide**
**Last Updated:** 2026-01-27
**Status:** ✅ Complete

---

## Table of Contents

1. [Overview](#overview)
2. [Why We Migrated](#why-we-migrated)
3. [Breaking Changes](#breaking-changes)
4. [Code Changes](#code-changes)
5. [Component Updates](#component-updates)
6. [API Changes](#api-changes)
7. [Session Management](#session-management)
8. [Testing the Migration](#testing-the-migration)
9. [Rollback Plan](#rollback-plan)

---

## Overview

PierceDesk migrated from **NextAuth.js** to **Supabase Auth** to provide tighter integration with the Supabase database and Row Level Security (RLS) policies.

### Migration Timeline

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase A** | Architecture planning | ✅ Complete |
| **Phase B** | Supabase Auth setup | ✅ Complete |
| **Phase C** | Organization model | ✅ Complete |
| **Phase D** | Organization setup flow | ✅ Complete |
| **Phase E** | Organization switching | ✅ Complete |
| **Phase F** | Testing & integration | ✅ Complete |
| **Phase G** | RLS verification | ✅ Complete |
| **Phase H** | E2E testing | ✅ Complete |

### Migration Scope

**What changed:**
- Authentication provider (NextAuth → Supabase)
- Session management (NextAuth sessions → Supabase cookies)
- User management (NextAuth adapters → Supabase `auth.users`)
- Auth hooks (`useSession` → `useSupabaseAuth`)
- Organization management (added multi-tenancy)

**What stayed the same:**
- UI components (LoginForm, SignupForm layouts)
- Route structure (`/authentication/...`)
- Application routing and navigation

---

## Why We Migrated

### Problems with NextAuth

1. **RLS Integration Gap**
   - NextAuth JWT doesn't directly map to PostgreSQL `auth.uid()`
   - Custom adapter logic needed for RLS policies
   - Complex session-to-database-user mapping

2. **Session Storage Complexity**
   - Required database session storage or JWT strategy
   - Custom adapter implementation needed
   - Cookie management manual

3. **Multi-Tenant Limitations**
   - No built-in organization context
   - Custom logic needed for organization switching
   - Session doesn't track active organization

4. **Supabase Disconnect**
   - NextAuth separate from Supabase ecosystem
   - Duplicate user management systems
   - Different authentication flows for different clients

### Benefits of Supabase Auth

1. **Native RLS Integration**
   ```sql
   -- Works automatically with Supabase Auth
   CREATE POLICY "projects_select"
     ON projects
     FOR SELECT
     USING (organization_id IN (SELECT get_user_org_ids()));
   ```

2. **Simplified Architecture**
   - Single authentication system (Supabase)
   - Automatic cookie management via `@supabase/ssr`
   - Built-in session refresh

3. **Better Multi-Tenancy**
   - Organization context integrated with auth
   - Session variables for RLS filtering
   - Seamless organization switching

4. **Unified Ecosystem**
   - Same authentication for web, mobile, API
   - Supabase Dashboard user management
   - Consistent auth experience

---

## Breaking Changes

### 1. Hook Changes

**Before (NextAuth):**
```javascript
import { useSession, signIn, signOut } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') return <div>Please log in</div>;

  return <div>Hello {session.user.email}</div>;
}
```

**After (Supabase):**
```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function MyComponent() {
  const { user, session, loading } = useSupabaseAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  return <div>Hello {user.email}</div>;
}
```

### 2. Sign In Changes

**Before (NextAuth):**
```javascript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email,
  password,
  redirect: false
});

if (result.error) {
  console.error(result.error);
}
```

**After (Supabase):**
```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

const { signIn } = useSupabaseAuth();

try {
  await signIn(email, password);
  // Automatic redirect handled by provider
} catch (error) {
  console.error(error.message);
}
```

### 3. Sign Out Changes

**Before (NextAuth):**
```javascript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/login' });
```

**After (Supabase):**
```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

const { signOut } = useSupabaseAuth();

await signOut();
// Automatic redirect to login handled by provider
```

### 4. Session Provider Changes

**Before (NextAuth):**
```javascript
// pages/_app.js
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
```

**After (Supabase):**
```javascript
// app/layout.jsx
import { SupabaseAuthProvider } from 'providers/SupabaseAuthProvider';
import { createClient } from 'lib/supabase/server';

export default async function RootLayout({ children }) {
  const supabase = await createClient();
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

### 5. API Route Changes

**Before (NextAuth):**
```javascript
// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Custom user validation
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) { ... },
    async session({ session, token }) { ... }
  }
});
```

**After (Supabase):**
```javascript
// No API routes needed!
// Authentication handled by Supabase Auth service
// OAuth callback at: app/auth/callback/route.js

import { createClient } from 'lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${requestUrl.origin}/`);
}
```

---

## Code Changes

### Authentication Components

#### LoginForm Component

**Before (NextAuth):**
```javascript
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**After (Supabase):**
```javascript
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

export default function LoginForm() {
  const { signIn, loading } = useSupabaseAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await signIn(
        formData.get('email'),
        formData.get('password')
      );
      // Provider handles redirect automatically
    } catch (error) {
      setError(error.message);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Protected Pages

#### Server Component Protection

**Before (NextAuth):**
```javascript
// pages/dashboard.jsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }

  return {
    props: { session }
  };
}

export default function Dashboard({ session }) {
  return <div>Hello {session.user.email}</div>;
}
```

**After (Supabase):**
```javascript
// app/dashboard/page.jsx
import { createClient } from 'lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/authentication/default/jwt/login');
  }

  return <div>Hello {user.email}</div>;
}
```

---

## Component Updates

### useSession → useSupabaseAuth

**Migration pattern:**

```javascript
// Before
const { data: session, status } = useSession();
const isLoading = status === 'loading';
const isAuthenticated = status === 'authenticated';
const userEmail = session?.user?.email;

// After
const { user, session, loading } = useSupabaseAuth();
const isLoading = loading;
const isAuthenticated = !!user;
const userEmail = user?.email;
```

### Common Component Patterns

#### 1. User Profile Display

```javascript
// Before (NextAuth)
function UserProfile() {
  const { data: session } = useSession();
  return <div>{session?.user?.name}</div>;
}

// After (Supabase)
function UserProfile() {
  const { user } = useSupabaseAuth();
  return <div>{user?.user_metadata?.full_name}</div>;
}
```

#### 2. Conditional Rendering

```javascript
// Before (NextAuth)
function ProtectedContent() {
  const { status } = useSession();

  if (status === 'loading') return <Spinner />;
  if (status === 'unauthenticated') return <LoginPrompt />;

  return <Content />;
}

// After (Supabase)
function ProtectedContent() {
  const { user, loading } = useSupabaseAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;

  return <Content />;
}
```

#### 3. Auth Actions

```javascript
// Before (NextAuth)
import { signIn, signOut } from 'next-auth/react';

function AuthButtons() {
  return (
    <>
      <button onClick={() => signIn()}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </>
  );
}

// After (Supabase)
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function AuthButtons() {
  const { signIn, signOut } = useSupabaseAuth();

  return (
    <>
      <button onClick={() => signIn('email@example.com', 'password')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </>
  );
}
```

---

## API Changes

### Client-Side API Calls

**Before (NextAuth):**
```javascript
import { getSession } from 'next-auth/react';

async function fetchUserData() {
  const session = await getSession();

  const response = await fetch('/api/user-data', {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    }
  });

  return response.json();
}
```

**After (Supabase):**
```javascript
import { createClient } from 'lib/supabase/client';

async function fetchUserData() {
  const supabase = createClient();

  // Supabase client automatically includes auth headers
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
```

### Server-Side API Calls

**Before (NextAuth):**
```javascript
import { getServerSession } from 'next-auth/next';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch data for user
  const data = await db.query('SELECT * FROM users WHERE id = ?', [session.user.id]);

  return Response.json(data);
}
```

**After (Supabase):**
```javascript
import { createClient } from 'lib/supabase/server';

export async function GET(request) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Fetch data (RLS automatically filters by user)
  const { data, error: queryError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (queryError) {
    return new Response('Error', { status: 500 });
  }

  return Response.json(data);
}
```

---

## Session Management

### Session Structure Changes

**Before (NextAuth):**
```javascript
{
  user: {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://...'
  },
  expires: '2025-01-27T00:00:00.000Z'
}
```

**After (Supabase):**
```javascript
{
  access_token: 'eyJhbGci...',
  refresh_token: 'v1.MR5p...',
  expires_in: 3600,
  expires_at: 1706400000,
  token_type: 'bearer',
  user: {
    id: 'user-uuid-123',
    email: 'john@example.com',
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: 'https://...'
    },
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z'
  }
}
```

### Accessing User Data

```javascript
// Before (NextAuth)
const { data: session } = useSession();
const userId = session?.user?.id;
const userName = session?.user?.name;
const userEmail = session?.user?.email;

// After (Supabase)
const { user, session } = useSupabaseAuth();
const userId = user?.id;
const userName = user?.user_metadata?.full_name;
const userEmail = user?.email;
```

---

## Testing the Migration

### Manual Testing Checklist

- [ ] **Sign Up**
  - [ ] User can create account with email/password
  - [ ] Confirmation email sent
  - [ ] Email verification works

- [ ] **Sign In**
  - [ ] User can log in with email/password
  - [ ] Invalid credentials show error
  - [ ] Successful login redirects to dashboard or org setup

- [ ] **Organization Setup**
  - [ ] New user redirected to organization setup
  - [ ] Can create new organization
  - [ ] Can join organization with invite code
  - [ ] Redirected to dashboard after org setup

- [ ] **Session Persistence**
  - [ ] User stays logged in after page refresh
  - [ ] Session survives browser restart
  - [ ] Session expires after configured duration

- [ ] **Sign Out**
  - [ ] User can sign out
  - [ ] Redirected to login page
  - [ ] Protected pages redirect to login after sign out

- [ ] **Organization Switching**
  - [ ] User with multiple orgs sees switcher
  - [ ] Can switch between organizations
  - [ ] Data updates after switching
  - [ ] RLS enforces correct data access

- [ ] **Protected Routes**
  - [ ] Unauthenticated users redirected to login
  - [ ] Authenticated users can access protected pages
  - [ ] Middleware correctly refreshes sessions

### Automated Testing

See Playwright E2E tests:
- `tests/authentication.spec.js`
- `tests/organization-switching.spec.js`
- `tests/rls-isolation.spec.js`

---

## Rollback Plan

### If Migration Fails

**Emergency rollback steps:**

1. **Revert Code Changes**
   ```bash
   git revert <migration-commit-hash>
   git push origin main
   ```

2. **Restore NextAuth Configuration**
   - Re-enable NextAuth API routes
   - Restore `SessionProvider` in root layout
   - Revert `useSession` hook usage

3. **Database Rollback**
   ```sql
   -- Disable RLS policies
   ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

   -- Drop Supabase-specific functions
   DROP FUNCTION IF EXISTS get_user_org_ids();
   DROP FUNCTION IF EXISTS create_organization_for_user();
   ```

4. **User Communication**
   - Inform users of rollback
   - Request re-authentication if needed
   - Provide support for any data access issues

### Prevention Measures

- ✅ Feature flags for gradual rollout
- ✅ Comprehensive E2E test coverage
- ✅ Database migrations are reversible
- ✅ Monitoring and alerting for auth failures

---

## Related Documentation

- [SUPABASE-AUTH.md](./SUPABASE-AUTH.md) - Supabase Auth implementation guide
- [ORGANIZATION-SETUP.md](./ORGANIZATION-SETUP.md) - Multi-tenancy and organization management
- [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md) - Session lifecycle and RLS integration

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Migrating from NextAuth to Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Status:** ✅ Complete - Migration Successful
