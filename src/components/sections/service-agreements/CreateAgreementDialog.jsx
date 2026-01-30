'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material';
import { agreementTypes, billingFrequencies } from 'data/service-agreements/agreements';
import { companies } from 'data/crm/deals';
import { users } from 'data/users';

const CreateAgreementDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    accountId: '',
    type: 'recurring_maintenance',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    billingFrequency: 'monthly',
    monthlyFee: '',
    includedHours: '',
    overageRate: '',
    autoRenew: true,
    accountManagerId: '',
    siteStreet: '',
    siteCity: '',
    siteState: '',
    siteZip: '',
    description: '',
    terms: '',
  });

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('Creating agreement:', formData);
    // TODO: Implement actual creation logic
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Service Agreement</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ pt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Agreement Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Account"
                value={formData.accountId}
                onChange={handleChange('accountId')}
                required
              >
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Agreement Type"
                value={formData.type}
                onChange={handleChange('type')}
                required
              >
                {Object.entries(agreementTypes).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Agreement Terms
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Billing Frequency"
                value={formData.billingFrequency}
                onChange={handleChange('billingFrequency')}
                required
              >
                {Object.entries(billingFrequencies).map(([key, value]) => (
                  <MenuItem key={key} value={key}>
                    {value.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Account Manager"
                value={formData.accountManagerId}
                onChange={handleChange('accountManagerId')}
                required
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoRenew}
                    onChange={handleChange('autoRenew')}
                  />
                }
                label="Auto-renew agreement"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Billing Details
          </Typography>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Monthly Fee"
                value={formData.monthlyFee}
                onChange={handleChange('monthlyFee')}
                InputProps={{ startAdornment: '$' }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Included Hours/Period"
                value={formData.includedHours}
                onChange={handleChange('includedHours')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Overage Rate"
                value={formData.overageRate}
                onChange={handleChange('overageRate')}
                InputProps={{ startAdornment: '$' }}
                helperText="Per hour"
                required
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom>
            Service Location
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.siteStreet}
                onChange={handleChange('siteStreet')}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="City"
                value={formData.siteCity}
                onChange={handleChange('siteCity')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.siteState}
                onChange={handleChange('siteState')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="ZIP" value={formData.siteZip} onChange={handleChange('siteZip')} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create Agreement
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateAgreementDialog;
