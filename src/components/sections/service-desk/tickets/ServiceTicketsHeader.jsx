'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import CreateTicketDialog from './CreateTicketDialog';

const ServiceTicketsHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { down } = useBreakpoints();
  const downSm = down('sm');

  const handleCreateTicket = () => {
    setShowCreateDialog(true);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCloseDialog = () => {
    setShowCreateDialog(false);
  };

  return (
    <>
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={downSm ? 'column' : 'row'}
          alignItems={downSm ? 'stretch' : 'center'}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Service Tickets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track service requests, incidents, and maintenance tickets
            </Typography>
          </Box>

          <Stack
            direction={downSm ? 'column' : 'row'}
            spacing={2}
            alignItems="center"
            sx={{ minWidth: downSm ? '100%' : 400 }}
          >
            <TextField
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={handleSearch}
              size="small"
              fullWidth={downSm}
              sx={{ minWidth: downSm ? '100%' : 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="material-symbols:search" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<IconifyIcon icon="material-symbols:add" />}
              onClick={handleCreateTicket}
              fullWidth={downSm}
              sx={{ whiteSpace: 'nowrap' }}
            >
              New Ticket
            </Button>
          </Stack>
        </Stack>
      </Box>
      
      <CreateTicketDialog
        open={showCreateDialog}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default ServiceTicketsHeader;
