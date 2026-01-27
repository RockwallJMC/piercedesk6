'use client';

import { useState, useCallback } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useUserOrganizations, useSwitchOrganization } from '@/services/swr/api-hooks/useOrganizationApi';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import IconifyIcon from 'components/base/IconifyIcon';

/**
 * OrganizationSwitcher Component
 *
 * A Material-UI dropdown for switching between user's organizations.
 * Displays current organization and allows selection of different organizations.
 *
 * Features:
 * - Shows current active organization
 * - Lists all user's organizations
 * - Handles organization switching with loading state
 * - Displays errors gracefully
 * - Integrates with Supabase auth context
 *
 * @param {Object} props - Component props
 * @param {boolean} props.compact - Use compact styling (for AppBar)
 * @param {Object} props.sx - Additional sx styling
 * @returns {JSX.Element} Organization switcher dropdown
 */
const OrganizationSwitcher = ({ compact = false, sx = {} }) => {
  const { data: organizations, isLoading: loadingOrgs, error: fetchError } = useUserOrganizations();
  const { trigger: switchOrganization, isMutating } = useSwitchOrganization();
  const { setOrganization } = useSupabaseAuth();
  const [error, setError] = useState(null);

  // Find current active organization
  const currentOrg = organizations?.find((org) => org.isActive);

  /**
   * Handle organization change
   * Switches to selected organization and updates auth context
   */
  const handleChange = useCallback(
    async (event) => {
      const selectedOrgId = event.target.value;

      // Don't switch if selecting current org
      if (selectedOrgId === currentOrg?.id) {
        return;
      }

      try {
        setError(null);

        // Call switch organization API
        const result = await switchOrganization({ organizationId: selectedOrgId });

        // Update auth context with new organization
        await setOrganization(selectedOrgId);

        // Optional: Could add success notification here
      } catch (err) {
        setError(err.message || 'Failed to switch organization');
        console.error('Organization switch error:', err);
      }
    },
    [currentOrg?.id, switchOrganization, setOrganization]
  );

  // Loading state while fetching organizations
  if (loadingOrgs) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minWidth: compact ? 150 : 200,
          ...sx,
        }}
      >
        <CircularProgress size={compact ? 20 : 24} />
        {!compact && (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        )}
      </Box>
    );
  }

  // No organizations available
  if (!organizations || organizations.length === 0) {
    return (
      <Box sx={{ minWidth: compact ? 150 : 200, ...sx }}>
        <Typography variant="body2" color="text.secondary">
          No organizations available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: compact ? 150 : 200, ...sx }}>
      <FormControl fullWidth size={compact ? 'small' : 'medium'}>
        {!compact && <InputLabel id="organization-switcher-label">Organization</InputLabel>}
        <Select
          labelId="organization-switcher-label"
          id="organization-switcher"
          value={currentOrg?.id || ''}
          label={compact ? undefined : 'Organization'}
          onChange={handleChange}
          disabled={isMutating}
          startAdornment={
            isMutating ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              <IconifyIcon
                icon="material-symbols:business-rounded"
                sx={{ mr: 1, color: 'text.secondary' }}
              />
            )
          }
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {organizations.map((org) => (
            <MenuItem key={org.id} value={org.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontWeight: org.isActive ? 600 : 400,
                    color: org.isActive ? 'primary.main' : 'text.primary',
                  }}
                >
                  {org.name}
                </Typography>
                {org.isActive && (
                  <IconifyIcon
                    icon="material-symbols:check-circle-rounded"
                    sx={{ color: 'success.main', fontSize: 18 }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Error Alert */}
      {(error || fetchError) && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mt: 1 }}
        >
          {error || fetchError?.message || 'An error occurred'}
        </Alert>
      )}
    </Box>
  );
};

export default OrganizationSwitcher;
