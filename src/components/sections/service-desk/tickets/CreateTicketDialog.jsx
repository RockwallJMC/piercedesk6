'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import IconifyIcon from 'components/base/IconifyIcon';
import { ticketTypes, slaPolicies, ticketSources } from 'data/service-desk/tickets';
import { companies } from 'data/crm/deals';
import { users } from 'data/users';

const CreateTicketDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'incident',
    priority: 'medium',
    source: 'email',
    account: null,
    serviceAgreement: '',
    assignedTo: null,
    siteAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleAddressChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      siteAddress: {
        ...prev.siteAddress,
        [field]: event.target.value,
      },
    }));
  };

  const handleAccountChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      account: newValue,
    }));
  };

  const handleAssigneeChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: newValue,
    }));
  };

  const handleSubmit = () => {
    // TODO: Implement ticket creation logic
    console.log('Creating ticket:', formData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'incident',
      priority: 'medium',
      source: 'email',
      account: null,
      serviceAgreement: '',
      assignedTo: null,
      siteAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Create New Service Ticket</Typography>
          <IconButton onClick={handleClose} size="small">
            <IconifyIcon icon="material-symbols:close" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange('title')}
              fullWidth
              required
              placeholder="Brief description of the issue or request"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange('description')}
              fullWidth
              multiline
              rows={4}
              required
              placeholder="Detailed description of the issue, steps to reproduce, or request details"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={handleInputChange('type')}
                label="Type"
              >
                {Object.entries(ticketTypes).map(([key, type]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconifyIcon icon={type.icon} />
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={handleInputChange('priority')}
                label="Priority"
              >
                {Object.entries(slaPolicies).map(([key, policy]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: policy.color,
                        }}
                      />
                      {policy.priority.toUpperCase()}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Source</InputLabel>
              <Select
                value={formData.source}
                onChange={handleInputChange('source')}
                label="Source"
              >
                {Object.entries(ticketSources).map(([key, source]) => (
                  <MenuItem key={key} value={key}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconifyIcon icon={source.icon} />
                      {source.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium" sx={{ mt: 2 }}>
              Account Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={companies}
              getOptionLabel={(option) => option.name}
              value={formData.account}
              onChange={handleAccountChange}
              renderInput={(params) => (
                <TextField {...params} label="Account" placeholder="Account" required />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Service Agreement"
              value={formData.serviceAgreement}
              onChange={handleInputChange('serviceAgreement')}
              fullWidth
              placeholder="SA-2024-001"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => option.name}
              value={formData.assignedTo}
              onChange={handleAssigneeChange}
              renderInput={(params) => (
                <TextField {...params} label="Assign To" />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title || !formData.description || !formData.account}
        >
          Create Ticket
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicketDialog;
