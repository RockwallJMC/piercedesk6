'use client';

import { Box, Paper, Typography, Grid, Divider, Stack, Chip } from '@mui/material';
import { billingFrequencies, calculateOverageCharges } from 'data/service-agreements/agreements';

const BillingHistory = ({ agreement }) => {
  const { currentPeriod } = agreement;
  const overageCharges = calculateOverageCharges(agreement);
  const totalCurrentPeriod = agreement.monthlyFee + overageCharges;

  // Mock billing history
  const billingHistory = [
    {
      period: 'January 2024',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      monthlyFee: agreement.monthlyFee,
      hoursUsed: 15.5,
      overageHours: 0,
      overageCharges: 0,
      total: agreement.monthlyFee,
      status: 'paid',
    },
    {
      period: 'December 2023',
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      monthlyFee: agreement.monthlyFee,
      hoursUsed: 18.0,
      overageHours: 0,
      overageCharges: 0,
      total: agreement.monthlyFee,
      status: 'paid',
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Current Period */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Period
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Period
                </Typography>
                <Typography variant="body2">
                  {new Date(currentPeriod.startDate).toLocaleDateString()} -{' '}
                  {new Date(currentPeriod.endDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Monthly Fee
                </Typography>
                <Typography variant="h6">${agreement.monthlyFee.toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Hours Used / Included
                </Typography>
                <Typography variant="body2">
                  {currentPeriod.hoursUsed} / {agreement.includedHoursPerPeriod}
                </Typography>
              </Box>
              {currentPeriod.overageHours > 0 && (
                <Box>
                  <Typography variant="caption" color="error.main">
                    Overage Charges
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    ${overageCharges.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentPeriod.overageHours} hrs × ${agreement.overageRate}/hr
                  </Typography>
                </Box>
              )}
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Period Total
                </Typography>
                <Typography variant="h5">${totalCurrentPeriod.toFixed(2)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Billing History */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Billing History
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {billingHistory.map((bill, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle2">{bill.period}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(bill.startDate).toLocaleDateString()} -{' '}
                        {new Date(bill.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        {bill.hoursUsed} hours used
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6">${bill.total.toFixed(2)}</Typography>
                      <Chip label={bill.status.toUpperCase()} size="small" color="success" />
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingHistory;
