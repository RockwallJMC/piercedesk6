# Session Management and Row Level Security (RLS)

**PierceDesk Session Architecture and Data Isolation**
**Last Updated:** 2026-01-27
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Session Lifecycle](#session-lifecycle)
3. [Cookie-Based Sessions](#cookie-based-sessions)
4. [Session Refresh](#session-refresh)
5. [RLS Architecture](#rls-architecture)
6. [RLS Helper](#rls-helper)
7. [Session Variables](#session-variables)
8. [Database Functions](#database-functions)
9. [RLS Policies](#rls-policies)
10. [Multi-Organization Users](#multi-organization-users)
11. [Testing RLS](#testing-rls)

---

## Overview

PierceDesk uses **Supabase Auth** for session management combined with **PostgreSQL Row Level Security (RLS)** for multi-tenant data isolation.

### Key Features

- ✅ **HTTP-only cookies** - Secure session storage
- ✅ **Automatic session refresh** - Handled by middleware
- ✅ **PostgreSQL RLS** - Database-level data isolation
- ✅ **Session variables** - Organization context for RLS
- ✅ **Multi-tenant support** - Users can access multiple organizations
- ✅ **Zero-trust model** - All data access enforced at database level

---

## Session Lifecycle

### 1. Authentication

User signs in via Supabase Auth (email/password or OAuth):

```javascript
const { signIn } = useSupabaseAuth();
await signIn('user@example.com', 'password');
```

### 2. Session Creation

Supabase creates a session with:
- **Access Token** (JWT) - Valid for 1 hour
- **Refresh Token** - Valid for 7 days (configurable)
- **User object** - User metadata

```javascript
{
  access_token: "eyJhbGci...",
  refresh_token: "v1.MR5p...",
  expires_in: 3600,
  expires_at: 1706400000,
  token_type: "bearer",
  user: {
    id: "user-uuid-123",
    email: "user@example.com",
    ...
  }
}
```

### 3. Cookie Storage

Session tokens stored in HTTP-only cookies:

```
Set-Cookie: sb-access-token=eyJhbGci...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600
Set-Cookie: sb-refresh-token=v1.MR5p...; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

### 4. Session Refresh

Middleware automatically refreshes session on each request:

```javascript
// middleware.js
export async function middleware(request) {
  const { supabase, response } = createClient(request);

  // This call refreshes the session if needed
  const { data: { user } } = await supabase.auth.getUser();

  return response; // Response has updated cookies
}
```

### 5. Session Expiry

- **Access token expires** → Automatically refreshed using refresh token
- **Refresh token expires** → User must re-authenticate
- **Both expired** → Middleware redirects to login

---

## Cookie-Based Sessions

### Why Cookies?

Supabase Auth uses HTTP-only cookies for session management instead of localStorage:

| Feature | Cookies | LocalStorage |
|---------|---------|--------------|
| **XSS Protection** | ✅ HTTP-only prevents JavaScript access | ❌ Vulnerable to XSS |
| **SSR Compatible** | ✅ Sent with every request | ❌ Client-side only |
| **Automatic Management** | ✅ Browser handles send/receive | ❌ Manual handling required |
| **CSRF Protection** | ✅ SameSite=Lax | ❌ No built-in protection |

### Cookie Attributes

```
sb-access-token
├─ HttpOnly     → Prevents JavaScript access (XSS protection)
├─ Secure       → HTTPS-only transmission
├─ SameSite=Lax → CSRF protection
├─ Path=/       → Available for entire site
└─ Max-Age=3600 → Expires in 1 hour

sb-refresh-token
├─ HttpOnly     → Prevents JavaScript access
├─ Secure       → HTTPS-only transmission
├─ SameSite=Lax → CSRF protection
├─ Path=/       → Available for entire site
└─ Max-Age=604800 → Expires in 7 days
```

### Cookie Management in Code

#### Browser Client (Client Components)

```javascript
// src/lib/supabase/client.js
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  // Cookies managed automatically by @supabase/ssr
}
```

#### Server Client (Server Components)

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
            // Server Component context - cookies may be read-only
          }
        },
      },
    }
  );
}
```

#### Middleware Client

```javascript
// src/lib/supabase/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export function createClient(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

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
```

---

## Session Refresh

### Automatic Refresh in Middleware

Middleware handles session refresh transparently:

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

```javascript
// src/lib/supabase/middleware.js
export async function updateSession(request) {
  const { supabase, response } = createClient(request);

  // This call automatically refreshes the session if needed
  const { data: { user }, error } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect to login if session expired
  if ((error || !user) && isProtectedRoute(pathname)) {
    const loginUrl = new URL('/authentication/default/jwt/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Return response with updated cookies
  return response;
}
```

### Manual Session Refresh

In rare cases, you may need to manually refresh:

```javascript
import { createClient } from 'lib/supabase/client';

const supabase = createClient();

// Manually refresh session
const { data, error } = await supabase.auth.refreshSession();

if (error) {
  console.error('Session refresh failed:', error);
  // User needs to re-authenticate
}
```

### Session Expiration Handling

```javascript
// Listen for session expiration events
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed:', session);
  }

  if (event === 'SIGNED_OUT') {
    console.log('Session expired, user signed out');
    // Redirect to login
  }
});
```

---

## RLS Architecture

### Overview

**Row Level Security (RLS)** is a PostgreSQL feature that enforces data access control at the database level.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT APP                           │
│  User makes query: SELECT * FROM projects;                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                           │
│  Adds auth headers and user JWT to request                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   POSTGRESQL + RLS                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Authenticate user from JWT (auth.uid())                  │
│  2. Load RLS policies for projects table                     │
│  3. Apply policy filter:                                     │
│     WHERE organization_id IN (SELECT get_user_org_ids())    │
│  4. Execute filtered query                                   │
│  5. Return ONLY projects user has access to                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Benefits of RLS

1. **Defense in Depth** - Security enforced at database level (can't be bypassed)
2. **Zero-Trust Model** - No application-level access control needed
3. **Consistent Rules** - Same policies for all clients (web, mobile, API)
4. **Audit Trail** - Database logs show who accessed what
5. **Performance** - Indexes can optimize RLS queries

---

## RLS Helper

### setOrganizationContext Function

The `setOrganizationContext` function sets the PostgreSQL session variable `app.current_org_id`, which is used by RLS policies.

```javascript
// src/lib/supabase/rls-helper.js

/**
 * Sets the organization context for the current database session.
 *
 * This sets the `app.current_org_id` session variable which is used
 * by Row Level Security (RLS) policies to filter data access.
 *
 * @param {Object} supabase - The Supabase client instance
 * @param {string|null} organizationId - The UUID of the organization
 * @returns {Promise<string|null>} The organization ID that was set
 */
async function setOrganizationContext(supabase, organizationId) {
  const { data, error } = await supabase.rpc('set_config', {
    setting: 'app.current_org_id',
    value: organizationId,
    is_local: true,
  });

  if (error) {
    throw new Error(`Failed to set organization context: ${error.message}`);
  }

  return organizationId;
}

module.exports = { setOrganizationContext };
```

### Usage in SupabaseAuthProvider

```javascript
// src/providers/SupabaseAuthProvider.jsx
import { setOrganizationContext } from 'lib/supabase/rls-helper';

export function SupabaseAuthProvider({ children }) {
  const supabase = createClient();

  useEffect(() => {
    if (user && organizationId) {
      // Set RLS session variable
      setOrganizationContext(supabase, organizationId);
    }
  }, [user, organizationId, supabase]);

  // ...
}
```

### When to Set Organization Context

Organization context should be set:

1. **After user login** - When `organizationId` is determined
2. **After organization switch** - When user selects different org
3. **On page load** - When initializing auth state
4. **Before data queries** - Ensures RLS filters correctly

---

## Session Variables

### PostgreSQL Session Variables

Session variables are per-connection settings in PostgreSQL:

```sql
-- Set a session variable
SELECT set_config('app.current_org_id', 'org-uuid-123', true);

-- Read a session variable
SELECT current_setting('app.current_org_id', true);

-- Returns: 'org-uuid-123'
```

### app.current_org_id Variable

PierceDesk uses `app.current_org_id` to track the active organization:

```javascript
// Set via RLS helper
await setOrganizationContext(supabase, 'org-uuid-123');

// SQL equivalent
SELECT set_config('app.current_org_id', 'org-uuid-123', true);
```

**Parameters:**
- `setting` - Variable name (`app.current_org_id`)
- `value` - Organization UUID or `null`
- `is_local` - `true` = session-scoped (not transaction-scoped)

### Scope and Lifetime

```
┌─────────────────────────────────────────────────────────────┐
│  Connection 1 (User A)                                       │
│  app.current_org_id = 'org-uuid-123'                         │
│  → Queries return Org 123 data                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Connection 2 (User B)                                       │
│  app.current_org_id = 'org-uuid-456'                         │
│  → Queries return Org 456 data                               │
└─────────────────────────────────────────────────────────────┘
```

Session variables are:
- **Per-connection** - Each database connection has its own value
- **Session-scoped** - Persists for the lifetime of the connection
- **Not shared** - Different connections have independent values

---

## Database Functions

### set_config Function

Built-in PostgreSQL function for setting session variables:

```sql
-- Function signature
set_config(
  setting text,      -- Variable name (e.g., 'app.current_org_id')
  value text,        -- Value to set (e.g., 'org-uuid-123')
  is_local boolean   -- true = session-scoped, false = transaction-scoped
) RETURNS text
```

**Usage in Supabase:**
```javascript
await supabase.rpc('set_config', {
  setting: 'app.current_org_id',
  value: organizationId,
  is_local: true
});
```

### get_user_org_ids Function

Returns array of organization IDs the current user belongs to:

```sql
-- Function definition
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
    AND is_active = TRUE
$function$
```

**Usage:**
```sql
-- In RLS policy
WHERE organization_id IN (SELECT get_user_org_ids())

-- Direct query
SELECT * FROM get_user_org_ids();
-- Returns:
-- org-uuid-1
-- org-uuid-2
```

### get_user_organization_ids Function

Similar to `get_user_org_ids`, accepts user_id parameter:

```sql
CREATE OR REPLACE FUNCTION public.get_user_organization_ids(target_user_id UUID)
RETURNS UUID[]
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT ARRAY_AGG(organization_id)
  FROM organization_members
  WHERE user_id = target_user_id
    AND is_active = TRUE
$function$
```

**Usage:**
```sql
-- Get orgs for specific user
SELECT get_user_organization_ids('user-uuid-123');
-- Returns: {org-uuid-1, org-uuid-2}
```

---

## RLS Policies

### Policy Pattern

All multi-tenant tables use the same RLS policy pattern:

```sql
-- SELECT policy
CREATE POLICY "{table}_select"
  ON public.{table}
  FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- INSERT policy
CREATE POLICY "{table}_insert"
  ON public.{table}
  FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

-- UPDATE policy
CREATE POLICY "{table}_update"
  ON public.{table}
  FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()));

-- DELETE policy
CREATE POLICY "{table}_delete"
  ON public.{table}
  FOR DELETE
  USING (organization_id IN (SELECT get_user_org_ids()));
```

### Example: Projects Table

```sql
-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT projects from their organizations
CREATE POLICY "projects_select"
  ON public.projects
  FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Allow users to INSERT projects into their organizations
CREATE POLICY "projects_insert"
  ON public.projects
  FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()));

-- Allow users to UPDATE projects in their organizations
CREATE POLICY "projects_update"
  ON public.projects
  FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()));

-- Allow users to DELETE projects in their organizations
CREATE POLICY "projects_delete"
  ON public.projects
  FOR DELETE
  USING (organization_id IN (SELECT get_user_org_ids()));
```

### Tables with RLS Enabled

**Core CRM Tables:**
- `organizations`
- `organization_members`
- `user_profiles`
- `projects`
- `tasks`
- `accounts`
- `contacts`
- `leads`
- `deals`

**Security Tables:**
- `devices`
- `properties`
- `zones`
- `access_logs`

**Communication Tables:**
- `conversations`
- `messages`
- `meetings`
- `events`

**Asset Tables:**
- `files`
- `folders`

**Total:** 35+ tables with RLS enabled

---

## Multi-Organization Users

### Challenge

A user can belong to multiple organizations:

```
User A
├─ Organization 1 (Owner)
├─ Organization 2 (Admin)
└─ Organization 3 (Member)
```

### Solution: get_user_org_ids()

The `get_user_org_ids()` function returns ALL organizations the user belongs to:

```sql
SELECT organization_id
FROM organization_members
WHERE user_id = auth.uid()
  AND is_active = TRUE;

-- Returns:
-- org-uuid-1
-- org-uuid-2
-- org-uuid-3
```

### RLS Filter Behavior

RLS policies use `IN (SELECT get_user_org_ids())`:

```sql
-- User A queries projects
SELECT * FROM projects;

-- RLS applies filter
WHERE organization_id IN (
  SELECT get_user_org_ids()  -- Returns: org-1, org-2, org-3
);

-- User sees projects from ALL their organizations
```

### Active Organization vs. RLS

**Two levels of filtering:**

1. **Active Organization (Application Level)**
   - UI shows data from currently selected organization
   - `is_active = true` in `organization_members`
   - Managed by `OrganizationSwitcher` component

2. **RLS Policies (Database Level)**
   - Enforces user can ONLY access data from organizations they belong to
   - Prevents unauthorized access even if application has bugs
   - `WHERE organization_id IN (SELECT get_user_org_ids())`

**Example:**
```javascript
// User A belongs to Org 1, Org 2, Org 3
// Active organization: Org 1

// Application query (filtered by active org)
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('organization_id', activeOrgId); // Only Org 1 projects

// RLS still enforces user CAN access Org 1, 2, 3 data
// But NOT Org 4, 5, 6 (which user doesn't belong to)
```

---

## Testing RLS

### Manual SQL Testing

#### Test 1: Verify User Organizations

```sql
-- Check which organizations a user belongs to
SELECT
  u.email,
  o.name as organization,
  om.role,
  om.is_active
FROM auth.users u
JOIN organization_members om ON om.user_id = u.id
JOIN organizations o ON o.id = om.organization_id
WHERE u.email = 'user@example.com';
```

#### Test 2: Verify RLS Filtering

```sql
-- Simulate user query with RLS
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid-123';

-- This query will be filtered by RLS
SELECT name, organization_id
FROM projects;

-- Should ONLY return projects from user's organizations
```

#### Test 3: Cross-Organization Isolation

```sql
-- Verify User A cannot see User B's organization data
SELECT
  u.email as user_email,
  o.name as organization,
  p.name as project,
  CASE
    WHEN p.organization_id = ANY(
      SELECT organization_id
      FROM organization_members
      WHERE user_id = u.id AND is_active = TRUE
    )
    THEN 'ALLOWED'
    ELSE 'BLOCKED'
  END as rls_decision
FROM auth.users u
CROSS JOIN organizations o
LEFT JOIN projects p ON p.organization_id = o.id
WHERE u.email IN ('userA@example.com', 'userB@example.com')
ORDER BY u.email, o.name;
```

### Automated RLS Testing

See: [Phase G RLS Verification](../../database-documentation/phase-g-rls-verification.md)

**Test scenarios:**
1. ✅ Single-organization users can ONLY see their org's data
2. ✅ Multi-organization users can see ALL their orgs' data
3. ✅ Users CANNOT see data from organizations they don't belong to
4. ✅ INSERT/UPDATE/DELETE operations are RLS-protected

### Example Test Results

```
User: Charlie Brown (Alpha only)
├─ Can see: Alpha Project 1, Alpha Project 2 ✓
└─ Cannot see: Beta Project 1, Beta Project 2 ✓

User: Henry Ford (Beta only)
├─ Can see: Beta Project 1, Beta Project 2 ✓
└─ Cannot see: Alpha Project 1, Alpha Project 2 ✓

User: Olivia Pope (Both Alpha and Beta)
├─ Can see: Alpha Project 1, Alpha Project 2 ✓
└─ Can see: Beta Project 1, Beta Project 2 ✓
```

### Playwright E2E RLS Tests

```javascript
// tests/organization-switching.spec.js
import { test, expect } from '@playwright/test';

test('user can only see data from their organizations', async ({ page }) => {
  // Login as User A (Org 1 only)
  await page.goto('/authentication/default/jwt/login');
  await page.fill('[name=email]', 'userA@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('[type=submit]');

  // Navigate to projects
  await page.goto('/projects');

  // Should see Org 1 projects
  await expect(page.locator('text=Org 1 Project')).toBeVisible();

  // Should NOT see Org 2 projects
  await expect(page.locator('text=Org 2 Project')).not.toBeVisible();
});
```

---

## Related Documentation

- [SUPABASE-AUTH.md](./SUPABASE-AUTH.md) - Authentication system overview
- [ORGANIZATION-SETUP.md](./ORGANIZATION-SETUP.md) - Multi-tenancy and organization management
- [Database RLS Verification](../../database-documentation/phase-g-rls-verification.md) - Comprehensive RLS test results
- [Database Architecture](../../database-documentation/database-architecture.md) - Multi-tenant schema design

---

## References

- [Supabase Auth Sessions](https://supabase.com/docs/guides/auth/sessions)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Status:** ✅ Production Ready
