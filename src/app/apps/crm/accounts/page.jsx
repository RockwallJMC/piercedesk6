'use client';

import { useMemo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axiosInstance from 'services/axios/axiosInstance';
import { useAccounts } from 'services/swr/api-hooks/useAccountsApi';

const AccountsPage = () => {
  const { accounts, isLoading, isError, error, mutate } = useAccounts();
  const [filter, setFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const filtered = useMemo(() => {
    if (!filter) return accounts;
    return accounts.filter((r) => r.name?.toLowerCase().includes(filter.toLowerCase()));
  }, [filter, accounts]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      if (editing) {
        // Update existing account
        await axiosInstance.patch(`/api/crm/accounts/${editing}`, form);
      } else {
        // Create new account - need organization_id
        // For MVP, get first org from an existing account or fail gracefully
        let organizationId = accounts[0]?.organization_id;

        if (!organizationId) {
          // Fetch user's organizations if no accounts exist yet
          const orgsResponse = await axiosInstance.get('/api/organizations');
          organizationId = orgsResponse[0]?.id;
        }

        if (!organizationId) {
          throw new Error('No organization found. Please contact support.');
        }

        await axiosInstance.post('/api/crm/accounts', {
          ...form,
          organization_id: organizationId,
        });
      }

      // Refresh the accounts list
      await mutate();
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: '', industry: '', website: '', phone: '' });
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.data?.error || err.message || 'Failed to save account');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await axiosInstance.delete(`/api/crm/accounts/${id}`);
      await mutate();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.data?.error || 'Failed to delete account');
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'industry', headerName: 'Industry', flex: 1 },
    { field: 'website', headerName: 'Website', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={() => {
              setEditing(params.row.id);
              setForm({
                name: params.row.name || '',
                industry: params.row.industry || '',
                website: params.row.website || '',
                phone: params.row.phone || '',
              });
              setViewMode(true);
              setDialogOpen(true);
            }}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => {
              setEditing(params.row.id);
              setForm({
                name: params.row.name || '',
                industry: params.row.industry || '',
                website: params.row.website || '',
                phone: params.row.phone || '',
              });
              setViewMode(false);
              setDialogOpen(true);
            }}
          >
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </Stack>
      ),
      flex: 1,
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load accounts: {error?.data?.error || error?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Accounts</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setViewMode(false);
            setForm({ name: '', industry: '', website: '', phone: '' });
            setSaveError(null);
            setDialogOpen(true);
          }}
        >
          Add Account
        </Button>
      </Stack>

      <TextField
        placeholder="Search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        inputProps={{ role: 'searchbox' }}
      />

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          disableColumnMenu
          initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {viewMode ? 'View Account' : editing ? 'Edit Account' : 'Create Account'}
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {saveError && (
              <Alert severity="error" onClose={() => setSaveError(null)}>
                {saveError}
              </Alert>
            )}
            <TextField
              label="Account Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              disabled={viewMode}
            />
            <TextField
              label="Industry"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              disabled={viewMode}
            />
            <TextField
              label="Website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              disabled={viewMode}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={viewMode}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            {viewMode ? 'Close' : 'Cancel'}
          </Button>
          {!viewMode && (
            <Button variant="contained" onClick={handleSave} disabled={saving || !form.name}>
              {saving ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AccountsPage;
