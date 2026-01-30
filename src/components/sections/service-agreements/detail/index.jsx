'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Paper, Grid, Chip, Typography, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  serviceAgreements,
  agreementTypes,
  agreementStatuses,
  calculateOverageCharges,
} from 'data/service-agreements/agreements';
import paths from 'routes/paths';
import AgreementOverview from './AgreementOverview';
import CoveredEquipment from './CoveredEquipment';
import MaintenanceSchedules from './MaintenanceSchedules';
import BillingHistory from './BillingHistory';

const ServiceAgreementDetail = ({ agreementId }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);

  const agreement = serviceAgreements.find((a) => a.id === agreementId);

  if (!agreement) {
    return (
      <Box p={3}>
        <Typography>Agreement not found</Typography>
      </Box>
    );
  }

  const overageCharges = calculateOverageCharges(agreement);
  const { hoursUsed, hoursRemaining, overageHours } = agreement.currentPeriod;
  const totalHours = hoursUsed + hoursRemaining;
  const usagePercentage = totalHours > 0 ? (hoursUsed / totalHours) * 100 : 0;

  const tabs = [
    { label: 'Overview', icon: 'material-symbols:dashboard-outline' },
    { label: 'Equipment', icon: 'material-symbols:precision-manufacturing', count: agreement.coveredEquipmentCount },
    { label: 'Schedules', icon: 'material-symbols:calendar-month', count: agreement.activeSchedulesCount },
    { label: 'Billing', icon: 'material-symbols:payments-outline' },
  ];

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Button
              size="small"
              startIcon={<IconifyIcon icon="material-symbols:arrow-back" />}
              onClick={() => router.push(paths.serviceAgreements)}
              sx={{ mb: 1 }}
            >
              Back to Agreements
            </Button>
            <Typography variant="h4" gutterBottom>
              {agreement.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {agreement.agreementNumber} • {agreement.account.name}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              label={agreementStatuses[agreement.status].label}
              sx={{
                bgcolor: `${agreementStatuses[agreement.status].color}15`,
                color: agreementStatuses[agreement.status].color,
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<IconifyIcon icon={agreementTypes[agreement.type].icon} />}
              label={agreementTypes[agreement.type].label}
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Monthly Fee
              </Typography>
              <Typography variant="h6">${agreement.monthlyFee.toFixed(2)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Hours Used
              </Typography>
              <Typography variant="h6">
                {hoursUsed} / {totalHours}
              </Typography>
              <Box sx={{ width: '100%', height: 6, bgcolor: 'grey.200', borderRadius: 1, mt: 0.5 }}>
                <Box
                  sx={{
                    width: `${usagePercentage}%`,
                    height: '100%',
                    bgcolor: overageHours > 0 ? 'error.main' : 'primary.main',
                    borderRadius: 1,
                  }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Overage Charges
              </Typography>
              <Typography variant="h6" color={overageCharges > 0 ? 'error.main' : 'inherit'}>
                ${overageCharges.toFixed(2)}
              </Typography>
              {overageHours > 0 && (
                <Typography variant="caption" color="error.main">
                  {overageHours} overage hours
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Agreement End
              </Typography>
              <Typography variant="h6">
                {new Date(agreement.endDate).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color={agreement.autoRenew ? 'success.main' : 'text.secondary'}>
                {agreement.autoRenew ? 'Auto-renews' : 'Manual renewal'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)} sx={{ px: 2 }}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconifyIcon icon={tab.icon} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <Chip label={tab.count} size="small" sx={{ height: 20, minWidth: 20 }} />
                  )}
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {currentTab === 0 && <AgreementOverview agreement={agreement} />}
        {currentTab === 1 && <CoveredEquipment agreementId={agreement.id} />}
        {currentTab === 2 && <MaintenanceSchedules agreementId={agreement.id} />}
        {currentTab === 3 && <BillingHistory agreement={agreement} />}
      </Box>

      {/* Floating Actions */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24 }}>
        <Button variant="contained" startIcon={<IconifyIcon icon="material-symbols:edit" />}>
          Edit Agreement
        </Button>
      </Box>
    </Box>
  );
};

export default ServiceAgreementDetail;
