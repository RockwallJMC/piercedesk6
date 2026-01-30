'use client';

import { Box, Paper, Grid, Typography, Divider, Stack, Chip } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { billingFrequencies } from 'data/service-agreements/agreements';

const AgreementOverview = ({ agreement }) => {
  return (
    <Grid container spacing={3}>
      {/* Left Column */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Agreement Details
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Agreement Number
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {agreement.agreementNumber}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Account
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {agreement.account.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body2">
                {new Date(agreement.startDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body2">
                {new Date(agreement.endDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Billing Frequency
              </Typography>
              <Typography variant="body2">
                {billingFrequencies[agreement.billingFrequency].label}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Account Manager
              </Typography>
              <Typography variant="body2">{agreement.accountManager.name}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description & Terms
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" paragraph>
            {agreement.description}
          </Typography>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Terms & Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {agreement.terms}
          </Typography>
        </Paper>
      </Grid>

      {/* Right Column */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Service Location
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={0.5}>
            <Typography variant="body2">{agreement.siteAddress.street}</Typography>
            <Typography variant="body2">
              {agreement.siteAddress.city}, {agreement.siteAddress.state} {agreement.siteAddress.zipCode}
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Stats
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Covered Equipment
              </Typography>
              <Chip label={agreement.coveredEquipmentCount} size="small" color="primary" />
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Active Schedules
              </Typography>
              <Chip label={agreement.activeSchedulesCount} size="small" color="success" />
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Open Tickets
              </Typography>
              <Chip label={agreement.openTicketsCount} size="small" color="warning" />
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AgreementOverview;
