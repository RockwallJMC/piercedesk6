'use client';

import { useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import IconifyIcon from 'components/base/IconifyIcon';
import { serviceAgreements, agreementTypes, agreementStatuses } from 'data/service-agreements/agreements';
import paths from 'routes/paths';
import CreateAgreementDialog from './CreateAgreementDialog';

const ServiceAgreementsList = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAgreements =
    filterStatus === 'all'
      ? serviceAgreements
      : serviceAgreements.filter((a) => a.status === filterStatus);

  const columns = [
    {
      field: 'agreementNumber',
      headerName: 'Agreement #',
      width: 150,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
          onClick={() => router.push(paths.serviceAgreementDetails(params.row.id))}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.account?.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 180,
      renderCell: (params) => (
        <Chip
          icon={<IconifyIcon icon={agreementTypes[params.value].icon} />}
          label={agreementTypes[params.value].label}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={agreementStatuses[params.value].label}
          size="small"
          sx={{
            bgcolor: `${agreementStatuses[params.value].color}15`,
            color: agreementStatuses[params.value].color,
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'monthlyFee',
      headerName: 'Monthly Fee',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2">${params.value.toFixed(2)}</Typography>
      ),
    },
    {
      field: 'currentPeriod',
      headerName: 'Hours Used',
      width: 150,
      renderCell: (params) => {
        const { hoursUsed, hoursRemaining, overageHours } = params.value;
        const total = hoursUsed + hoursRemaining;
        const percentage = total > 0 ? (hoursUsed / total) * 100 : 0;
        return (
          <Box>
            <Typography variant="body2">
              {hoursUsed} / {total} hrs
            </Typography>
            <Box sx={{ width: '100%', height: 4, bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
              <Box
                sx={{
                  width: `${percentage}%`,
                  height: '100%',
                  bgcolor: overageHours > 0 ? 'error.main' : 'primary.main',
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120,
      valueFormatter: (params) => new Date(params).toLocaleDateString(),
    },
    {
      field: 'accountManager',
      headerName: 'Manager',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">{params.value?.name}</Typography>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Service Agreements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage ongoing service contracts and maintenance agreements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="material-symbols:add" />}
          onClick={() => setOpenDialog(true)}
        >
          New Agreement
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} mb={2}>
        {['all', ...Object.keys(agreementStatuses)].map((status) => (
          <Chip
            key={status}
            label={status === 'all' ? 'All' : agreementStatuses[status].label}
            onClick={() => setFilterStatus(status)}
            color={filterStatus === status ? 'primary' : 'default'}
            variant={filterStatus === status ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      <DataGrid
        rows={filteredAgreements}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        sx={{ height: 600 }}
      />

      <CreateAgreementDialog open={openDialog} onClose={() => setOpenDialog(false)} />
    </Box>
  );
};

export default ServiceAgreementsList;
