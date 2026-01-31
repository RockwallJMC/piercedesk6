'use client';

import { Box, CircularProgress, Alert, Paper } from '@mui/material';
import DashboardSelectMenu from 'components/common/DashboardSelectMenu';
import SectionHeader from 'components/common/SectionHeader';
import ActiveUsersChart from './ActiveUsersChart';
import { useCRMDashboardApi } from '@/services/swr/api-hooks/useCRMDashboardApi';

const ActiveUsers = () => {
  const { activeUsers, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) {
    return (
      <Paper sx={{ height: 1, overflow: 'hidden', p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 380 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (hasError || !activeUsers) {
    return (
      <Paper sx={{ height: 1, overflow: 'hidden', p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column' }}>
        <Alert severity="error">Failed to load active users</Alert>
      </Paper>
    );
  }

  // Generate simple chart data from API metrics (placeholder visualization)
  // API returns: {activeToday, activeThisWeek, activeThisMonth, trend}
  const avgDaily = activeUsers.activeThisMonth / 30;
  const activeUsersData = Array(30).fill().map((_, i) =>
    Math.max(0, Math.round(avgDaily + (Math.random() - 0.5) * avgDaily * 0.5))
  );

  return (
    <Paper
      sx={{
        height: 1,
        overflow: 'hidden',
        p: { xs: 3, md: 5 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SectionHeader
        title="Monthly Active Users"
        subTitle="Product categories occupying warehouse space"
        sx={{ mb: { xs: 2, md: 4 } }}
        actionComponent={
          <DashboardSelectMenu
            options={[
              {
                value: 15,
                label: 'Last 15 days',
              },
              {
                value: 7,
                label: 'Last 7 days',
              },
              {
                value: 30,
                label: 'Last 30 days',
              },
            ]}
            defaultValue={15}
            sx={{ minWidth: 0 }}
          />
        }
      />

      <Box
        sx={{
          overflowX: 'auto',
        }}
      >
        <ActiveUsersChart data={activeUsersData} sx={{ minHeight: 380, minWidth: 800, width: 1 }} />
      </Box>
    </Paper>
  );
};

export default ActiveUsers;
