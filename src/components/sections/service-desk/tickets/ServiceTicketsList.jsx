'use client';

import { useState, useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import IconifyIcon from 'components/base/IconifyIcon';
import { serviceTicketsWithSLA, ticketStatuses, ticketTypes, slaPolicies } from 'data/service-desk/tickets';
import SLAIndicator from '../sla/SLAIndicator';

const ServiceTicketsList = () => {
  const [tickets] = useState(serviceTicketsWithSLA);
  const [selectedTickets, setSelectedTickets] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeSpent = (hours) => {
    if (!hours) return '-';
    return `${hours}h`;
  };

  const columns = [
    {
      field: 'id',
      headerName: 'Ticket ID',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="medium" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {params.row.account?.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => {
        const type = ticketTypes[params.value];
        return (
          <Chip
            icon={<IconifyIcon icon={type.icon} />}
            label={type.label}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => {
        const policy = slaPolicies[params.value];
        return (
          <Chip
            data-testid="priority-chip"
            label={params.value.toUpperCase()}
            size="small"
            sx={{
              bgcolor: policy.color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = ticketStatuses[params.value];
        return (
          <Chip
            data-testid="status-chip"
            label={status.label}
            size="small"
            sx={{
              bgcolor: status.color,
              color: 'white',
            }}
          />
        );
      },
    },
    {
      field: 'assignedTo',
      headerName: 'Assigned To',
      width: 150,
      renderCell: (params) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.secondary">
              Unassigned
            </Typography>
          );
        }
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              src={params.value.avatar}
              alt={params.value.name}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="body2" noWrap>
              {params.value.name}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'sla',
      headerName: 'SLA Status',
      width: 120,
      renderCell: (params) => (
        <SLAIndicator
          data-testid="sla-indicator"
          ticket={params.row}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: 'totalTimeLogged',
      headerName: 'Time Logged',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatTimeSpent(params.value)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" title="View Details" onClick={() => handleViewTicket(params.row.id)}>
              <IconifyIcon icon="material-symbols:visibility-outline" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Ticket">
            <IconButton size="small" title="Edit Ticket" onClick={() => handleEditTicket(params.row.id)}>
              <IconifyIcon icon="material-symbols:edit-outline" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const handleViewTicket = (ticketId) => {
    // Navigate to ticket details
    console.log('View ticket:', ticketId);
  };

  const handleEditTicket = (ticketId) => {
    // Open edit dialog
    console.log('Edit ticket:', ticketId);
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedTickets(newSelection);
  };

  const rows = useMemo(() => {
    return tickets.map((ticket) => ({
      ...ticket,
      id: ticket.id,
    }));
  }, [tickets]);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={handleSelectionChange}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 25 },
          },
          sorting: {
            sortModel: [{ field: 'createdAt', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
          },
        }}
      />
    </Box>
  );
};

export default ServiceTicketsList;
