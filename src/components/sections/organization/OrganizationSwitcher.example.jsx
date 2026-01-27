/**
 * OrganizationSwitcher Usage Examples
 *
 * This file demonstrates how to integrate the OrganizationSwitcher component
 * into various parts of the application.
 */

'use client';

import OrganizationSwitcher from './OrganizationSwitcher';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

// Example 1: Basic Usage
export const BasicUsage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <OrganizationSwitcher />
    </Box>
  );
};

// Example 2: Compact Mode (for AppBar/Toolbar)
export const CompactMode = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          PierceDesk
        </Typography>
        <OrganizationSwitcher compact />
      </Toolbar>
    </AppBar>
  );
};

// Example 3: With Custom Styling
export const CustomStyling = () => {
  return (
    <Box sx={{ p: 3 }}>
      <OrganizationSwitcher
        sx={{
          minWidth: 300,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'background.paper',
          },
        }}
      />
    </Box>
  );
};

// Example 4: In ProfileMenu (Integration Pattern)
export const ProfileMenuIntegration = () => {
  // In src/layouts/main-layout/common/ProfileMenu.jsx
  // Add this inside the Menu component, after the user info section:

  return `
    <Stack sx={{ px: 3, py: 2 }}>
      <OrganizationSwitcher compact />
    </Stack>
    <Divider />
  `;
};

/**
 * Integration Guide
 *
 * To integrate OrganizationSwitcher into ProfileMenu:
 *
 * 1. Import the component:
 *    import OrganizationSwitcher from 'components/sections/organization/OrganizationSwitcher';
 *
 * 2. Add it after the user profile section and before the menu items:
 *    <Stack sx={{ px: 3, py: 2 }}>
 *      <OrganizationSwitcher compact />
 *    </Stack>
 *    <Divider />
 *
 * 3. The component will automatically:
 *    - Fetch user's organizations
 *    - Display current active organization
 *    - Handle switching with loading states
 *    - Update the auth context
 *    - Show error messages if switch fails
 *
 * Component Features:
 * - Automatic loading state while fetching organizations
 * - Disabled state during organization switch
 * - Error handling with Alert display
 * - Active organization highlighted with checkmark
 * - Responsive sizing (compact mode for toolbars)
 * - Theme-aware styling (uses theme tokens)
 *
 * Props:
 * @param {boolean} compact - Use compact styling (smaller size, no label)
 * @param {Object} sx - Additional MUI sx styling object
 */
