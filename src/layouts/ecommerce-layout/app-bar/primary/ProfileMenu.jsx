'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import {
  Box,
  Button,
  Divider,
  listClasses,
  Menu,
  MenuItem,
  paperClasses,
  Stack,
  Typography,
} from '@mui/material';
import paths, { authPaths } from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';
import OrganizationSwitcher from 'components/sections/organization/OrganizationSwitcher';

const ProfileMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  const { user: authUser, signOut: supabaseSignOut, loading } = useSupabaseAuth();

  // Transform Supabase user to match expected format
  const user = useMemo(() => {
    if (!authUser) return null;

    return {
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email,
      image: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
      designation: authUser.user_metadata?.designation,
    };
  }, [authUser]);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        color="neutral"
        variant="text"
        shape="circle"
        onClick={handleClick}
        sx={{
          height: 44,
          width: 44,
        }}
      >
        <StatusAvatar
          alt="Captain Haddock"
          status="online"
          src={user.image || undefined}
          sx={{ width: 36, height: 36 }}
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 267 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            p: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={user.name}
            src={user.image ?? undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {user.name}
            </Typography>
            {user.designation && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'warning.main',
                }}
              >
                {user.designation}
                <IconifyIcon
                  icon="material-symbols:diamond-rounded"
                  color="warning.main"
                  sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
                />
              </Typography>
            )}
          </Box>
        </Stack>

        <Divider />
        <Box sx={{ py: 1, px: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            Organization
          </Typography>
          <OrganizationSwitcher compact />
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <MenuItem onClick={handleClose}>Your account</MenuItem>
          <MenuItem onClick={handleClose}>Account settings</MenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <MenuItem onClick={handleClose}>Orders</MenuItem>
          <MenuItem onClick={handleClose}>Track order</MenuItem>
          <MenuItem onClick={handleClose}>Wishlist</MenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <MenuItem onClick={handleClose}>Membership</MenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <MenuItem onClick={handleClose}>Plans & Subscription</MenuItem>
          <MenuItem onClick={handleClose}>Payment methods</MenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          {user ? (
            <MenuItem
              onClick={async () => {
                handleClose();
                await supabaseSignOut();
                router.push(authPaths.login);
              }}
            >
              Log out
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleClose();
                router.push(authPaths.login);
              }}
            >
              Sign In
            </MenuItem>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
