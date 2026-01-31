'use client';

import { Avatar, ButtonBase, CircularProgress, Alert, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import KPI from './KPI';
import { useCRMDashboardApi } from '@/services/swr/api-hooks/useCRMDashboardApi';

const CRMKPIs = () => {
  const { kpis, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) {
    return (
      <Grid size={12}>
        <Paper background={1} sx={{ p: { xs: 3, md: 5 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Paper>
      </Grid>
    );
  }

  if (hasError || !kpis) {
    return (
      <Grid size={12}>
        <Paper background={1} sx={{ p: { xs: 3, md: 5 } }}>
          <Alert severity="error">Failed to load KPIs</Alert>
        </Paper>
      </Grid>
    );
  }

  return (
    <>
      {kpis.map((kpi) => (
        <Grid key={kpi.title} size={{ xs: 6, sm: 4, lg: 6, xl: 4 }}>
          <KPI {...kpi} />
        </Grid>
      ))}

      <Grid size={{ xs: 6, sm: 4, lg: 6, xl: 4 }}>
        <Paper
          background={1}
          sx={{
            height: 1,
            '&:hover': {
              bgcolor: 'background.elevation2',
            },
          }}
        >
          <ButtonBase
            sx={{
              p: { xs: 3, md: 5 },
              height: 1,
              width: 1,
              display: 'grid',
              placeContent: 'center',
              justifyItems: 'center',
            }}
          >
            <Avatar sx={{ mb: 3, bgcolor: 'primary.light' }}>
              <IconifyIcon icon="material-symbols:add-2-rounded" sx={{ fontSize: 24 }} />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Add New KPI
            </Typography>
          </ButtonBase>
        </Paper>
      </Grid>
    </>
  );
};

export default CRMKPIs;
