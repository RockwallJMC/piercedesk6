'use client';

import { CircularProgress, Alert, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import DashboardMenu from 'components/common/DashboardMenu';
import SectionHeader from 'components/common/SectionHeader';
import SaleFunnelChart from './SaleFunnelChart';
import SaleFunnelTable from './SaleFunnelTable';
import { useCRMDashboardApi } from '@/services/swr/api-hooks/useCRMDashboardApi';

const stageColors = {
  'Contact': 'chBlue.100',
  'MQL': 'chBlue.200',
  'SQL': 'chBlue.300',
  'Opportunity': 'chBlue.400',
  'Won': 'chGreen.500',
  'Lost': 'chGrey.400'
};

const SaleFunnel = () => {
  const { salesFunnel, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) {
    return (
      <Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (hasError || !salesFunnel) {
    return (
      <Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>
        <Alert severity="error">Failed to load sales funnel</Alert>
      </Paper>
    );
  }

  // Transform API data [{stage, count, conversionRate}] to chart format {stage: count}
  const saleFunnelData = salesFunnel.reduce((acc, item) => {
    acc[item.stage.toLowerCase()] = item.count;
    return acc;
  }, {});

  // Transform API data to table format
  const saleFunnelTableData = salesFunnel.map(item => ({
    stageIndicator: stageColors[item.stage] || 'chBlue.300',
    stage: item.stage,
    lostLead: item.conversionRate, // Using conversion rate as the metric
    thisMonth: item.count // Using count as the this month value
  }));

  return (
    <Paper background={1} sx={{ height: 1, p: { xs: 3, md: 5 } }}>
      <SectionHeader
        title="Sale Funnel"
        subTitle="Amount of revenue in one month"
        actionComponent={<DashboardMenu />}
        sx={{ mb: 3 }}
      />
      <Grid container spacing={{ xs: 4, sm: 3, md: 4 }}>
        <Grid size={{ xs: 12, sm: 5, md: 6, xl: 12 }}>
          <SaleFunnelChart data={saleFunnelData} sx={{ width: 1, height: '254px !important' }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 7, md: 6, xl: 12 }}>
          <SaleFunnelTable data={saleFunnelTableData} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SaleFunnel;
