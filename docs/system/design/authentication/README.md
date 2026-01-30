# PierceDesk Authentication Documentation

**Complete guide to PierceDesk's Supabase-based authentication system**

---

## Overview

PierceDesk uses **Supabase Auth** for authentication, combined with **PostgreSQL Row Level Security (RLS)** for multi-tenant data isolation. This documentation covers the complete authentication implementation, from initial setup to advanced multi-organization workflows.

---

## Documentation Structure

### 1. [SUPABASE-AUTH.md](./SUPABASE-AUTH.md) - Core Authentication Guide

**What it covers:**
- Authentication architecture and flow
- Client and server setup
- Email/password and OAuth authentication
- Session management fundamentals
- `useSupabaseAuth` hook API reference
- `SupabaseAuthProvider` implementation
- Middleware for route protection
- Security best practices (OWASP compliance)
- Troubleshooting common issues

**Read this first if you're:**
- New to the PierceDesk authentication system
- Implementing authentication in a new component
- Debugging authentication issues
- Learning how Supabase Auth works

---

### 2. [ORGANIZATION-SETUP.md](./ORGANIZATION-SETUP.md) - Multi-Tenancy Guide

**What it covers:**
- Organization model and database schema
- User flow for organization setup
- Creating new organizations
- Joining organizations via invite codes
- Organization switching functionality
- Database functions (create, join, switch)
- Organization context management
- API hooks reference (`useUserOrganizations`, `useCreateOrganization`, etc.)
- Troubleshooting organization issues

**Read this if you're:**
- Working with multi-tenant features
- Implementing organization management UI
- Understanding data isolation architecture
- Adding organization-related functionality

---

### 3. [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md) - Sessions and RLS

**What it covers:**
- Session lifecycle (authentication → expiry)
- Cookie-based session storage
- Automatic session refresh in middleware
- Row Level Security (RLS) architecture
- RLS helper functions
- PostgreSQL session variables (`app.current_org_id`)
- Database functions for RLS (`get_user_org_ids`)
- RLS policy patterns and examples
- Multi-organization user access control
- Testing RLS data isolation

**Read this if you're:**
- Understanding how data isolation works
- Working with database queries and RLS policies
- Debugging data access issues
- Implementing new multi-tenant tables
- Testing security and data isolation

---

### 4. [MIGRATION-FROM-NEXTAUTH.md](./MIGRATION-FROM-NEXTAUTH.md) - Migration Reference

**What it covers:**
- Why we migrated from NextAuth to Supabase
- Breaking changes in the migration
- Code migration examples (before/after)
- Component update patterns
- API route changes
- Session structure differences
- Testing the migration
- Rollback plan

**Read this if you're:**
- Understanding the migration history
- Looking for NextAuth → Supabase migration patterns
- Curious about architectural decisions
- Working on similar migration projects

---

## Quick Start

### For Developers New to the Codebase

1. **Start here:** [SUPABASE-AUTH.md](./SUPABASE-AUTH.md) - Learn authentication basics
2. **Then read:** [ORGANIZATION-SETUP.md](./ORGANIZATION-SETUP.md) - Understand multi-tenancy
3. **Deep dive:** [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md) - Learn RLS and data isolation

### For Implementing Authentication

```javascript
// 1. Use the authentication hook
import { useSupabaseAuth } from 'hooks/useSupabaseAuth';

function MyComponent() {
  const { user, loading, signIn, signOut } = useSupabaseAuth();

  // 2. Check authentication state
  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;

  // 3. Access user data
  return <div>Hello {user.email}</div>;
}
```

**See:** [SUPABASE-AUTH.md - useSupabaseAuth Hook](./SUPABASE-AUTH.md#usesupbaseauth-hook)

### For Implementing Multi-Tenancy

```javascript
// 1. Fetch user's organizations
import { useUserOrganizations } from '@/services/swr/api-hooks/useOrganizationApi';

function OrganizationList() {
  const { data: organizations, isLoading } = useUserOrganizations();

  // 2. Display organizations
  return (
    <ul>
      {organizations?.map(org => (
        <li key={org.id}>{org.name}</li>
      ))}
    </ul>
  );
}
```

**See:** [ORGANIZATION-SETUP.md - API Hooks Reference](./ORGANIZATION-SETUP.md#api-hooks-reference)

### For Implementing RLS Policies

```sql
-- 1. Enable RLS on table
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- 2. Create SELECT policy
CREATE POLICY "your_table_select"
  ON your_table
  FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

-- 3. Create INSERT/UPDATE/DELETE policies
-- (Follow same pattern)
```

**See:** [SESSION-MANAGEMENT.md - RLS Policies](./SESSION-MANAGEMENT.md#rls-policies)

---

## Key Concepts

### Authentication Flow

```
User Login → Supabase Auth → Session Created → Cookies Set
→ Organization Loaded → RLS Context Set → Dashboard Access
```

### Multi-Tenant Architecture

```
Organizations (Tenants)
    ↓
organization_members (User-to-Org mapping)
    ↓
RLS Policies (Filter data by organization_id)
    ↓
Data Isolation (Users only see their org's data)
```

### Session and RLS Integration

```
User authenticates → Organization selected → Session variable set
→ RLS policies use session variable → Queries filtered automatically
```

---

## File Locations

### Core Implementation Files

| File | Purpose |
|------|---------|
| `src/hooks/useSupabaseAuth.js` | Auth hook for consuming context |
| `src/providers/SupabaseAuthProvider.jsx` | Auth context provider |
| `src/lib/supabase/client.js` | Browser Supabase client |
| `src/lib/supabase/server.js` | Server Supabase client |
| `src/lib/supabase/middleware.js` | Middleware for session refresh |
| `src/lib/supabase/rls-helper.js` | RLS session variable utilities |

### Organization Components

| File | Purpose |
|------|---------|
| `src/components/sections/organization/CreateOrganizationForm.jsx` | Create new organization UI |
| `src/components/sections/organization/JoinOrganizationForm.jsx` | Join via invite code UI |
| `src/components/sections/organization/OrganizationSwitcher.jsx` | Organization dropdown switcher |
| `src/services/swr/api-hooks/useOrganizationApi.js` | Organization API hooks |

### Database Schema

| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase user accounts |
| `public.user_profiles` | Extended user profile data |
| `public.organizations` | Organization/tenant entities |
| `public.organization_members` | User-to-organization mapping |

---

## Testing Resources

### Manual Testing

- **Authentication:** Sign up, sign in, sign out flows
- **Organization Setup:** Create org, join org, switch org
- **Data Isolation:** Verify users only see their org's data

### Automated Testing

- **E2E Tests:** `tests/authentication.spec.js`, `tests/organization-switching.spec.js`
- **RLS Verification:** [Phase G RLS Test Results](../../database-documentation/phase-g-rls-verification.md)

---

## Troubleshooting

### Common Issues

| Issue | Solution | Documentation |
|-------|----------|---------------|
| User not authenticated | Check session cookies, verify middleware | [SUPABASE-AUTH.md - Troubleshooting](./SUPABASE-AUTH.md#troubleshooting) |
| Stuck on org setup | Verify `is_active` flag in database | [ORGANIZATION-SETUP.md - Troubleshooting](./ORGANIZATION-SETUP.md#troubleshooting) |
| Wrong data displayed | Check RLS context, verify org switching | [SESSION-MANAGEMENT.md - Testing RLS](./SESSION-MANAGEMENT.md#testing-rls) |
| Session not persisting | Verify cookies, check middleware config | [SUPABASE-AUTH.md - Cookie Issues](./SUPABASE-AUTH.md#issue-session-not-persisting-after-login) |

---

## Related Documentation

### Database Documentation

- [Database Architecture](../../database-documentation/database-architecture.md) - Multi-tenant schema design
- [Phase G RLS Verification](../../database-documentation/phase-g-rls-verification.md) - Comprehensive RLS test results

### Project Documentation

- [Project README](../../README.md) - Root project documentation
- [Development Guide](../../development-and-technical/piercedesk-development.md) - Development setup

### External Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Auth Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Contributing

When contributing to authentication code:

1. **Read the relevant documentation** before making changes
2. **Follow OWASP security guidelines** for authentication and session management
3. **Test RLS policies** thoroughly with multi-organization scenarios
4. **Update documentation** if you change authentication behavior
5. **Write E2E tests** for new authentication features

---

## Support

For authentication-related questions:

1. **Check documentation** - This guide covers most scenarios
2. **Review code examples** - See implementation files for patterns
3. **Test locally** - Use Supabase Dashboard to inspect auth state
4. **Check logs** - Supabase Dashboard → Logs → Auth Logs

---

**Last Updated:** 2026-01-27
**Status:** ✅ Complete
**Version:** 1.0
