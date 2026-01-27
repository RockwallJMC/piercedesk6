# Organization Setup and Multi-Tenancy Guide

**PierceDesk Multi-Tenant Architecture**
**Last Updated:** 2026-01-27
**Status:** ✅ Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Organization Model](#organization-model)
3. [User Flow](#user-flow)
4. [Creating an Organization](#creating-an-organization)
5. [Joining an Organization](#joining-an-organization)
6. [Organization Switching](#organization-switching)
7. [Database Functions](#database-functions)
8. [Organization Context](#organization-context)
9. [API Hooks Reference](#api-hooks-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

PierceDesk implements a **multi-tenant architecture** where:

- Each **organization** represents a separate tenant with isolated data
- **Users** can belong to multiple organizations
- **One active organization** is selected at a time
- **Row Level Security (RLS)** enforces data isolation at the database level
- **Organization context** is managed via session variables

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Organization** | A tenant entity (company, team, workspace) |
| **Organization Member** | User-to-organization relationship with role |
| **Active Organization** | Currently selected organization for the user |
| **Organization Context** | RLS session variable filtering data access |
| **Invite Code** | Token for joining existing organizations |

---

## Organization Model

### Database Schema

#### `organizations` Table

```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Columns:**
- `id` - Unique organization identifier (UUID)
- `name` - Organization display name (e.g., "Acme Corporation")
- `slug` - URL-safe identifier (e.g., "acme-corporation")
- `created_at` - Organization creation timestamp
- `updated_at` - Last modification timestamp

#### `organization_members` Table

```sql
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

**Columns:**
- `id` - Membership record identifier
- `organization_id` - Reference to organization
- `user_id` - Reference to authenticated user
- `role` - User role within organization (`owner`, `admin`, `member`)
- `is_active` - Whether this is the currently active organization
- `joined_at` - Timestamp when user joined organization

**Indexes:**
```sql
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_active ON organization_members(user_id, is_active);
```

### Relationships

```
┌─────────────┐         ┌───────────────────────┐         ┌──────────────┐
│  auth.users │◄────────┤ organization_members  ├────────►│organizations │
└─────────────┘         └───────────────────────┘         └──────────────┘
      1:N                      N:M                              1:N
```

**One user can:**
- Belong to **multiple organizations** (N:M via `organization_members`)
- Have **one active organization** at a time (where `is_active = true`)

**One organization can:**
- Have **multiple users** as members
- Have data in all multi-tenant tables (filtered by RLS)

---

## User Flow

### First-Time User Journey

```
1. User signs up / logs in via Supabase Auth
   ↓
2. SupabaseAuthProvider checks if user has organization
   ↓
3a. No organization → Redirect to /organization-setup
   ├─> Option A: Create new organization
   └─> Option B: Join existing organization with invite code
   ↓
4. User creates/joins organization
   ↓
5. Organization set as active (is_active = true)
   ↓
6. SupabaseAuthProvider redirects to dashboard
   ↓
7. User accesses organization-specific data (RLS filters by org)
```

### Returning User Journey

```
1. User logs in via Supabase Auth
   ↓
2. SupabaseAuthProvider fetches user's active organization
   ↓
3a. Has active organization → Set organization context for RLS
   └─> Redirect to dashboard
   ↓
3b. No active organization → Redirect to /organization-setup
   ↓
4. User sees organization-filtered data throughout app
```

### Multi-Organization User Journey

```
1. User belongs to multiple organizations
   ↓
2. Dashboard shows OrganizationSwitcher dropdown
   ↓
3. User selects different organization from dropdown
   ↓
4. Frontend calls setOrganization(newOrgId)
   ↓
5. Backend updates is_active flag in organization_members
   ↓
6. RLS context updated (app.current_org_id session variable)
   ↓
7. Page refreshes → Data filtered by new organization
```

---

## Creating an Organization

### Using CreateOrganizationForm Component

```javascript
// src/components/sections/organization/CreateOrganizationForm.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const CreateOrganizationForm = () => {
  const { trigger, isMutating } = useCreateOrganization();
  const { setOrganization } = useSupabaseAuth();
  const [submitError, setSubmitError] = useState(null);

  const onSubmit = async (data) => {
    try {
      // Call API to create organization
      const orgId = await trigger({ name: data.name });

      // Set as active organization
      await setOrganization(orgId);

      // SupabaseAuthProvider handles redirect to dashboard
    } catch (error) {
      setSubmitError(error.message || 'Failed to create organization');
    }
  };

  // Form UI...
};
```

### Backend: create_organization_for_user Function

```sql
-- Database function (called by useCreateOrganization hook)
CREATE OR REPLACE FUNCTION public.create_organization_for_user(
  org_name TEXT,
  user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_org_id UUID;
  org_slug TEXT;
BEGIN
  -- Generate slug from name
  org_slug := LOWER(REGEXP_REPLACE(org_name, '[^a-zA-Z0-9]+', '-', 'g'));
  org_slug := TRIM(BOTH '-' FROM org_slug);

  -- Create organization
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO new_org_id;

  -- Add user as owner with active status
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    is_active
  )
  VALUES (
    new_org_id,
    user_id,
    'owner',
    TRUE
  );

  -- Create user profile if not exists
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (user_id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN new_org_id;
END;
$$;
```

### Usage Example

```javascript
// In organization-setup page
import CreateOrganizationForm from 'components/sections/organization/CreateOrganizationForm';

export default function OrganizationSetupPage() {
  return (
    <div>
      <h1>Create Your Organization</h1>
      <CreateOrganizationForm />
    </div>
  );
}
```

---

## Joining an Organization

### Using JoinOrganizationForm Component

```javascript
// src/components/sections/organization/JoinOrganizationForm.jsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useJoinOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const JoinOrganizationForm = () => {
  const { trigger, isMutating } = useJoinOrganization();
  const { setOrganization } = useSupabaseAuth();
  const [submitError, setSubmitError] = useState(null);

  const onSubmit = async (data) => {
    try {
      // Call API to join organization with invite code
      const orgId = await trigger({ inviteCode: data.inviteCode });

      // Set as active organization
      await setOrganization(orgId);

      // SupabaseAuthProvider handles redirect to dashboard
    } catch (error) {
      // Parse error message for user-friendly display
      if (error.message.includes('invalid')) {
        setSubmitError('Invalid invite code. Please check and try again.');
      } else if (error.message.includes('expired')) {
        setSubmitError('This invite code has expired. Please request a new one.');
      } else if (error.message.includes('already')) {
        setSubmitError("You're already a member of this organization.");
      } else {
        setSubmitError('Failed to join organization. Please try again.');
      }
    }
  };

  // Form UI...
};
```

### Backend: join_organization_by_invite Function

```sql
-- Database function (called by useJoinOrganization hook)
CREATE OR REPLACE FUNCTION public.join_organization_by_invite(
  invite_token TEXT,
  user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_org_id UUID;
  existing_membership UUID;
BEGIN
  -- Find organization by invite token
  -- (Assumes invite_tokens table exists with org_id and token)
  SELECT organization_id INTO target_org_id
  FROM public.invite_tokens
  WHERE token = invite_token
    AND expires_at > NOW()
    AND is_active = TRUE;

  IF target_org_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Check if user is already a member
  SELECT id INTO existing_membership
  FROM public.organization_members
  WHERE organization_id = target_org_id
    AND user_id = user_id;

  IF existing_membership IS NOT NULL THEN
    RAISE EXCEPTION 'User is already a member of this organization';
  END IF;

  -- Deactivate all other organizations for this user
  UPDATE public.organization_members
  SET is_active = FALSE
  WHERE user_id = user_id;

  -- Add user as member with active status
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    is_active
  )
  VALUES (
    target_org_id,
    user_id,
    'member',
    TRUE
  );

  -- Create user profile if not exists
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (user_id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN target_org_id;
END;
$$;
```

### Invite Code Generation (Admin Feature)

```javascript
// Example: Admin generates invite code for their organization
import { createClient } from 'lib/supabase/client';

async function generateInviteCode(organizationId) {
  const supabase = createClient();

  // Generate random alphanumeric code
  const token = Math.random().toString(36).substring(2, 12).toUpperCase();

  // Insert into invite_tokens table
  const { data, error } = await supabase
    .from('invite_tokens')
    .insert({
      organization_id: organizationId,
      token: token,
      created_by: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  return data.token; // Share this code with new members
}
```

---

## Organization Switching

### Using OrganizationSwitcher Component

```javascript
// src/components/sections/organization/OrganizationSwitcher.jsx
'use client';

import { useState, useCallback } from 'react';
import { Select, MenuItem } from '@mui/material';
import { useUserOrganizations, useSwitchOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const OrganizationSwitcher = ({ compact = false }) => {
  const { data: organizations, isLoading } = useUserOrganizations();
  const { trigger: switchOrganization, isMutating } = useSwitchOrganization();
  const { setOrganization } = useSupabaseAuth();
  const [error, setError] = useState(null);

  // Find current active organization
  const currentOrg = organizations?.find((org) => org.isActive);

  const handleChange = useCallback(async (event) => {
    const selectedOrgId = event.target.value;

    if (selectedOrgId === currentOrg?.id) return;

    try {
      setError(null);

      // Update organization_members table (set is_active)
      await switchOrganization({ organizationId: selectedOrgId });

      // Update auth context and RLS session variable
      await setOrganization(selectedOrgId);

      // Page will refresh with new organization's data
    } catch (err) {
      setError(err.message || 'Failed to switch organization');
    }
  }, [currentOrg?.id, switchOrganization, setOrganization]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Select
      value={currentOrg?.id || ''}
      onChange={handleChange}
      disabled={isMutating}
    >
      {organizations.map((org) => (
        <MenuItem key={org.id} value={org.id}>
          {org.name}
        </MenuItem>
      ))}
    </Select>
  );
};
```

### Integration in AppBar

```javascript
// Example: Add organization switcher to application header
import OrganizationSwitcher from 'components/sections/organization/OrganizationSwitcher';

export default function AppBar() {
  return (
    <header>
      <nav>
        <OrganizationSwitcher compact />
      </nav>
    </header>
  );
}
```

### Backend: Switch Organization Logic

```javascript
// src/services/swr/api-hooks/useOrganizationApi.js
const switchOrganizationMutation = async (url, { arg }) => {
  const supabase = createClient();
  const { organizationId } = arg;

  const { data: { user } } = await supabase.auth.getUser();

  // Deactivate all user's organizations
  await supabase
    .from('organization_members')
    .update({ is_active: false })
    .eq('user_id', user.id);

  // Activate target organization
  const { data, error } = await supabase
    .from('organization_members')
    .update({ is_active: true })
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Organization not found or permission denied');
  }

  return data[0];
};
```

---

## Database Functions

### create_organization_for_user

**Purpose:** Creates a new organization and adds the user as owner.

**Signature:**
```sql
create_organization_for_user(org_name TEXT, user_id UUID) RETURNS UUID
```

**Parameters:**
- `org_name` - Organization display name
- `user_id` - User ID from `auth.users`

**Returns:** Organization ID (UUID)

**Example:**
```sql
SELECT create_organization_for_user('Acme Corporation', 'user-uuid-123');
-- Returns: 'org-uuid-456'
```

**What it does:**
1. Generates URL-safe slug from organization name
2. Inserts new organization into `organizations` table
3. Adds user as `owner` with `is_active = true`
4. Creates user profile if doesn't exist

### join_organization_by_invite

**Purpose:** Adds user to existing organization via invite code.

**Signature:**
```sql
join_organization_by_invite(invite_token TEXT, user_id UUID) RETURNS UUID
```

**Parameters:**
- `invite_token` - Alphanumeric invite code
- `user_id` - User ID from `auth.users`

**Returns:** Organization ID (UUID)

**Example:**
```sql
SELECT join_organization_by_invite('ABC123XYZ', 'user-uuid-123');
-- Returns: 'org-uuid-456'
```

**What it does:**
1. Validates invite token (exists, not expired)
2. Checks user isn't already a member
3. Deactivates user's other organizations
4. Adds user as `member` with `is_active = true`
5. Creates user profile if doesn't exist

### get_user_org_ids

**Purpose:** Returns array of organization IDs user belongs to (used by RLS).

**Signature:**
```sql
get_user_org_ids() RETURNS SETOF UUID
```

**Parameters:** None (uses `auth.uid()`)

**Returns:** Set of organization UUIDs

**Example:**
```sql
SELECT * FROM get_user_org_ids();
-- Returns:
-- org-uuid-1
-- org-uuid-2
```

**Usage in RLS policies:**
```sql
CREATE POLICY "projects_select"
  ON public.projects
  FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));
```

---

## Organization Context

### Setting Organization Context for RLS

The `setOrganizationContext` function sets the PostgreSQL session variable `app.current_org_id` which is used by RLS policies.

```javascript
// src/lib/supabase/rls-helper.js
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
```

### Flow: Organization Context → RLS

```
1. User selects organization (via switcher or login)
   ↓
2. Frontend calls setOrganization(orgId)
   ↓
3. SupabaseAuthProvider calls setOrganizationContext(supabase, orgId)
   ↓
4. RLS helper calls set_config('app.current_org_id', orgId)
   ↓
5. PostgreSQL session variable set: app.current_org_id = orgId
   ↓
6. All subsequent queries filtered by RLS policies
   ↓
7. RLS policies check: WHERE organization_id IN (SELECT get_user_org_ids())
   ↓
8. User ONLY sees data for their organizations
```

### Reading Organization Context

```sql
-- Inside RLS policy or SQL query
SELECT current_setting('app.current_org_id', TRUE);
-- Returns: 'org-uuid-123' or NULL
```

### Persisting Organization Context

Organization context is persisted in:

1. **Database**: `organization_members.is_active = true`
2. **Session Variable**: `app.current_org_id` (per-connection)
3. **LocalStorage** (fallback): `localStorage.getItem('current_organization_id')`

---

## API Hooks Reference

### useUserOrganizations()

Fetches all organizations the user belongs to.

```javascript
import { useUserOrganizations } from '@/services/swr/api-hooks/useOrganizationApi';

function MyComponent() {
  const { data: organizations, isLoading, error } = useUserOrganizations();

  // organizations structure:
  // [
  //   {
  //     id: 'org-uuid-1',
  //     name: 'Acme Corporation',
  //     slug: 'acme-corporation',
  //     role: 'owner',
  //     isActive: true,
  //     joinedAt: '2025-01-01T00:00:00Z'
  //   },
  //   ...
  // ]
}
```

**Returns:**
- `data` - Array of organization objects
- `isLoading` - Boolean loading state
- `error` - Error object if fetch failed

### useCreateOrganization()

Creates a new organization.

```javascript
import { useCreateOrganization } from '@/services/swr/api-hooks/useOrganizationApi';

function CreateOrgButton() {
  const { trigger, isMutating } = useCreateOrganization();

  const handleCreate = async () => {
    try {
      const orgId = await trigger({ name: 'My New Organization' });
      console.log('Created organization:', orgId);
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={isMutating}>
      Create Organization
    </button>
  );
}
```

**Parameters:**
- `name` (string) - Organization name

**Returns:** Organization ID (UUID)

### useJoinOrganization()

Joins existing organization via invite code.

```javascript
import { useJoinOrganization } from '@/services/swr/api-hooks/useOrganizationApi';

function JoinOrgButton() {
  const { trigger, isMutating } = useJoinOrganization();

  const handleJoin = async (inviteCode) => {
    try {
      const orgId = await trigger({ inviteCode });
      console.log('Joined organization:', orgId);
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  return (
    <button onClick={() => handleJoin('ABC123')} disabled={isMutating}>
      Join Organization
    </button>
  );
}
```

**Parameters:**
- `inviteCode` (string) - Alphanumeric invite code

**Returns:** Organization ID (UUID)

### useSwitchOrganization()

Switches active organization.

```javascript
import { useSwitchOrganization } from '@/services/swr/api-hooks/useOrganizationApi';

function SwitchOrgButton({ targetOrgId }) {
  const { trigger, isMutating } = useSwitchOrganization();

  const handleSwitch = async () => {
    try {
      await trigger({ organizationId: targetOrgId });
      console.log('Switched to organization:', targetOrgId);
    } catch (error) {
      console.error('Failed to switch:', error);
    }
  };

  return (
    <button onClick={handleSwitch} disabled={isMutating}>
      Switch Organization
    </button>
  );
}
```

**Parameters:**
- `organizationId` (string) - Target organization UUID

**Returns:** Updated membership record

---

## Troubleshooting

### Issue: User stuck on organization-setup page

**Cause:** User has organization but `is_active = false` for all organizations.

**Solution:**
```sql
-- Fix: Activate user's first organization
UPDATE organization_members
SET is_active = TRUE
WHERE user_id = 'user-uuid-123'
  AND id = (
    SELECT id FROM organization_members
    WHERE user_id = 'user-uuid-123'
    ORDER BY joined_at ASC
    LIMIT 1
  );
```

### Issue: "Invalid invite code" error

**Possible causes:**
1. Invite code expired (`expires_at < NOW()`)
2. Invite code deactivated (`is_active = false`)
3. Invite code doesn't exist (typo)

**Solution:**
```sql
-- Check invite token status
SELECT *
FROM invite_tokens
WHERE token = 'ABC123';

-- Regenerate if expired
UPDATE invite_tokens
SET expires_at = NOW() + INTERVAL '7 days'
WHERE token = 'ABC123';
```

### Issue: User sees data from wrong organization

**Cause:** RLS context not set or set incorrectly.

**Solution:**
```javascript
// Manually refresh organization context
const { setOrganization, organizationId } = useSupabaseAuth();

useEffect(() => {
  if (organizationId) {
    setOrganization(organizationId); // Re-set context
  }
}, [organizationId, setOrganization]);
```

### Issue: Organization switcher not showing organizations

**Cause:** SWR cache not revalidating after org change.

**Solution:**
```javascript
import { mutate } from 'swr';

// Force revalidate user organizations
mutate('user-organizations');
```

### Issue: Multiple organizations showing as active

**Cause:** Database constraint not enforced or bug in switch logic.

**Solution:**
```sql
-- Fix: Ensure only one active organization per user
UPDATE organization_members om1
SET is_active = FALSE
WHERE user_id = 'user-uuid-123'
  AND is_active = TRUE
  AND id != (
    SELECT id FROM organization_members om2
    WHERE om2.user_id = om1.user_id
    ORDER BY joined_at DESC
    LIMIT 1
  );
```

---

## Related Documentation

- [SUPABASE-AUTH.md](./SUPABASE-AUTH.md) - Authentication system overview
- [SESSION-MANAGEMENT.md](./SESSION-MANAGEMENT.md) - Session lifecycle and RLS integration
- [Database RLS Verification](../../database-documentation/phase-g-rls-verification.md) - RLS test results
- [Database Architecture](../../database-documentation/database-architecture.md) - Multi-tenant schema design

---

## References

- [Supabase Multi-Tenancy Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)

---

**Document Version:** 1.0
**Last Updated:** 2026-01-27
**Status:** ✅ Production Ready
