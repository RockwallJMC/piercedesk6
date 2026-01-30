'use client';

import { useRouter } from 'next/navigation';
import { Button, List, ListItem, ListItemButton, ListItemText, Typography, Stack } from '@mui/material';
import { TEST_ORGS } from '@/tests-helpers/mock-orgs';

// Minimal org selection page to satisfy Playwright flows
const OrganizationsPage = () => {
  const router = useRouter();

  const handleSelect = (org) => {
    localStorage.setItem('activeOrg', org.name);
    router.push('/dashboard/crm');
  };

  return (
    <Stack spacing={3} sx={{ p: 4 }}>
      <Typography variant="h4">Select Organization</Typography>
      <List>
        {TEST_ORGS.map((org) => (
          <ListItem key={org.slug} disablePadding>
            <ListItemButton onClick={() => handleSelect(org)}>
              <ListItemText primary={org.name} secondary={org.slug} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button variant="outlined" onClick={() => router.push('/organizations/create')}>
        Create organization
      </Button>
    </Stack>
  );
};

export default OrganizationsPage;
