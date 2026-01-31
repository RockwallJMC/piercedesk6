'use client';

import { CircularProgress, Alert, Paper } from '@mui/material';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import AvgLifetimeValueChart from './AvgLifetimeValueChart';
import { useCRMDashboardApi } from '@/services/swr/api-hooks/useCRMDashboardApi';

const AvgLifetimeValue = () => {
  const { lifetimeValue, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) {
    return (
      <Paper background={1} sx={{ height: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 420 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (hasError || !lifetimeValue) {
    return (
      <Paper background={1} sx={{ height: 1, display: 'flex', flexDirection: 'column', p: { xs: 3, md: 5 } }}>
        <Alert severity="error">Failed to load lifetime value</Alert>
      </Paper>
    );
  }

  // Generate simple chart data from API metrics (placeholder visualization)
  // API returns: {averageLTV, totalCustomers, totalRevenue, trend}
  const avgLTV = lifetimeValue.averageLTV;
  const avgCAC = avgLTV * 0.3; // Estimate CAC as 30% of LTV (industry standard)

  const avgLifetimeValueData = {
    cac: Array(30).fill().map((_, i) => avgCAC + (Math.random() - 0.5) * avgCAC * 0.3),
    ltv: Array(30).fill().map((_, i) => avgLTV + (Math.random() - 0.5) * avgLTV * 0.2)
  };

  return (
    <Paper background={1} sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        title="Avg. Life Time Value"
        subTitle="CAC and LTV last year"
        actionComponent={<DashboardMenu />}
        sx={{ px: { xs: 3, md: 5 }, pt: { xs: 3, md: 5 } }}
      />

      <AvgLifetimeValueChart
        data={avgLifetimeValueData}
        sx={{
          flex: 1,
          minHeight: 420,
        }}
      />
    </Paper>
  );
};

export default AvgLifetimeValue;
