# Organization Components

This directory contains components for organization management in PierceDesk.

## Components

### OrganizationSwitcher

A Material-UI dropdown component for switching between user's organizations.

**File:** `OrganizationSwitcher.jsx`

**Features:**
- Displays current active organization
- Shows dropdown list of all user's organizations
- Handles organization switching with loading states
- Displays errors gracefully with Alert component
- Integrates with Supabase auth context
- Supports compact mode for AppBar/Toolbar usage
- Theme-aware styling using MUI theme tokens

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `compact` | boolean | `false` | Use compact styling (smaller size, no label) |
| `sx` | object | `{}` | Additional MUI sx styling |

**Usage:**

```jsx
import OrganizationSwitcher from 'components/sections/organization/OrganizationSwitcher';

// Basic usage
<OrganizationSwitcher />

// Compact mode for AppBar
<OrganizationSwitcher compact />

// With custom styling
<OrganizationSwitcher
  sx={{ minWidth: 300 }}
/>
```

**Integration with ProfileMenu:**

Add to `src/layouts/main-layout/common/ProfileMenu.jsx`:

```jsx
import OrganizationSwitcher from 'components/sections/organization/OrganizationSwitcher';

// Inside the Menu component, after user info section:
<Stack sx={{ px: 3, py: 2 }}>
  <OrganizationSwitcher compact />
</Stack>
<Divider />
```

**States:**

1. **Loading Organizations** - Shows CircularProgress while fetching
2. **Empty State** - Shows "No organizations available" message
3. **Normal State** - Dropdown with organization list
4. **Switching** - Disabled with loading indicator during switch
5. **Error State** - Alert displayed below dropdown

**Dependencies:**

- `@mui/material` - Material-UI components
- `useUserOrganizations` - SWR hook for fetching organizations
- `useSwitchOrganization` - SWR mutation hook for switching
- `useSupabaseAuth` - Auth context hook with setOrganization
- `IconifyIcon` - Icon component for business icon and checkmark

**API Integration:**

The component uses two API hooks:

1. **useUserOrganizations()** - Fetches user's organizations
   - Returns: `{ data, isLoading, error }`
   - Data structure: Array of organizations with `{ id, name, slug, isActive, ... }`

2. **useSwitchOrganization()** - Switches active organization
   - Returns: `{ trigger, isMutating }`
   - Trigger param: `{ organizationId }`
   - Updates `is_active` flag in `organization_members` table

3. **setOrganization(orgId)** - Updates auth context
   - Called after successful switch
   - Updates `organizationId` in SupabaseAuthContext

**Error Handling:**

- Network errors during fetch display in component
- Switch errors show Alert with dismiss button
- Errors logged to console for debugging
- Previous organization remains active on failure

**Accessibility:**

- Proper ARIA labels via FormControl/InputLabel
- Keyboard navigation supported (MUI Select)
- Focus management during dropdown open/close
- Loading states announced to screen readers
- Error messages accessible

**Testing:**

Tests located in `__tests__/OrganizationSwitcher.test.jsx`:

- Renders current organization name
- Displays all organizations in dropdown
- Switches organization on selection
- Shows loading state during switch
- Displays errors on failure
- Handles empty organizations list
- Prevents redundant API calls for active org

### CreateOrganizationForm

Form component for creating new organizations.

**File:** `CreateOrganizationForm.jsx`

**Features:**
- Form validation with Yup schema
- Creates new organization via API
- Updates auth context after creation
- Error handling and display

### JoinOrganizationForm

Form component for joining organizations via invite code.

**File:** `JoinOrganizationForm.jsx`

**Features:**
- Invite code validation
- Joins organization via API
- Updates auth context after joining
- Error handling and display

## Directory Structure

```
organization/
├── __tests__/
│   ├── OrganizationSwitcher.test.jsx
│   ├── CreateOrganizationForm.test.jsx
│   └── ...
├── OrganizationSwitcher.jsx
├── OrganizationSwitcher.example.jsx
├── CreateOrganizationForm.jsx
├── JoinOrganizationForm.jsx
└── README.md (this file)
```

## Development Guidelines

### Material-UI v7 Compliance

All components follow MUI v7 patterns:
- Use `sx` prop for styling
- Theme tokens for colors (never hardcoded)
- Responsive sizing via theme breakpoints
- Proper use of Grid with `size` prop
- FormControl/InputLabel/Select pattern

### Code Quality

- TypeScript/JSDoc documentation
- Functional components with hooks
- Proper error boundaries
- Loading states for async operations
- Accessible UI (WCAG 2.1 AA)

### Testing

- Jest + React Testing Library
- TDD approach (tests first)
- Mock SWR hooks and auth context
- Test all states: loading, error, success, empty
- User interaction testing with userEvent

## Future Enhancements

1. **Organization Creation from Switcher**
   - Add "+ Create Organization" option in dropdown
   - Quick creation modal/dialog

2. **Organization Search**
   - Autocomplete for large organization lists
   - Filter/search functionality

3. **Recent Organizations**
   - Track recently used organizations
   - Quick access section in dropdown

4. **Organization Avatars**
   - Display organization logos/avatars
   - Color-coded organization badges

5. **Keyboard Shortcuts**
   - Ctrl/Cmd + K to open switcher
   - Number keys for quick switching
