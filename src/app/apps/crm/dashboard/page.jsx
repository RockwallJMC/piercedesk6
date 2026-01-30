'use client';

import { Stack, Typography, Grid, Paper } from '@mui/material';

const Widget = ({ title, value }) => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
    <Typography variant="h5">{value}</Typography>
  </Paper>
);

const DashboardPage = () => {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h3">CRM Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Widget title="Total Pipeline Value" value="$1.2M" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Widget title="Weighted Forecast" value="$780K" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Widget title="Lead Conversion Rate" value="34%" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Pipeline Visualization
        </Typography>
        <Typography color="text.secondary">Pipeline Stage Breakdown · Deal Velocity · Win Loss Analysis</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Recent Activities</Typography>
        <Typography color="text.secondary">No recent activities.</Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">Lead Analytics</Typography>
        <Typography variant="h6">Leads by Source</Typography>
        <Typography variant="h6">Top Performing Accounts</Typography>
      </Paper>
    </Stack>
  );
};

export default DashboardPage;
