'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';

const CreateOrganizationPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleCreate = () => {
    localStorage.setItem('activeOrg', name || 'New Org');
    router.push('/dashboard/crm');
  };

  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 480 }}>
      <Typography variant="h4">Create Organization</Typography>
      <TextField label="Organization Name" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <Button variant="contained" onClick={handleCreate}>
        Create Organization
      </Button>
    </Stack>
  );
};

export default CreateOrganizationPage;
