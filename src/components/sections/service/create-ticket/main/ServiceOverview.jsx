import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TimePicker } from '@mui/x-date-pickers';
import DateRangePicker from 'components/base/DateRangePicker';
import IconifyIcon from 'components/base/IconifyIcon';

const ServiceOverview = () => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  const customerType = useWatch({
    control,
    name: 'customerType',
  });

  const sameAsServiceLocation = useWatch({
    control,
    name: 'invoiceAddressSameAsService',
  });

  return (
    <Stack spacing={3} direction="column">
      {/* Ticket Title */}
      <TextField
        fullWidth
        multiline
        rows={2}
        id="ticketTitle"
        type="text"
        label="Ticket Title"
        error={!!errors.ticketTitle}
        helperText={errors.ticketTitle?.message || 'Minimum 10 characters'}
        {...register('ticketTitle')}
      />

      {/* Service Location */}
      <TextField
        fullWidth
        id="serviceLocation"
        type="text"
        label="Service Location"
        variant="filled"
        error={!!errors.serviceLocation}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <IconifyIcon icon="material-symbols:location-on-outline" />
              </InputAdornment>
            ),
          },
        }}
        helperText={errors.serviceLocation?.message}
        {...register('serviceLocation')}
      />

      {/* Service Date Range */}
      <FormControl fullWidth error={!!errors.serviceDateRange} sx={{ mb: 1 }}>
        <Controller
          name="serviceDateRange"
          control={control}
          render={({ field }) => (
            <DateRangePicker
              selected={field.value?.[0] || undefined}
              startDate={field.value?.[0] || undefined}
              endDate={field.value?.[1] || undefined}
              onChange={(dates) => {
                field.onChange(dates);
              }}
              isClearable
              customInput={
                <TextField
                  label="Service Date Range"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconifyIcon icon="material-symbols:calendar-month-outline-rounded" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              }
            />
          )}
        />
        {errors.serviceDateRange && <FormHelperText>{errors.serviceDateRange?.message}</FormHelperText>}
      </FormControl>

      {/* Service Window */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Service Window
          <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>
            *
          </Box>
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={control}
              name="serviceWindowStart"
              render={({ field }) => (
                <TimePicker
                  label="Start time"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  slotProps={{
                    inputAdornment: {
                      position: 'start',
                    },
                    textField: {
                      fullWidth: true,
                      error: !!errors.serviceWindowStart,
                      helperText: errors.serviceWindowStart?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              control={control}
              name="serviceWindowEnd"
              render={({ field }) => (
                <TimePicker
                  label="End time"
                  value={field.value ?? null}
                  onChange={field.onChange}
                  slotProps={{
                    inputAdornment: {
                      position: 'start',
                    },
                    textField: {
                      fullWidth: true,
                      error: !!errors.serviceWindowEnd,
                      helperText: errors.serviceWindowEnd?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Customer Type */}
      <FormControl component="fieldset">
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Customer Type
          <Box component="span" sx={{ color: 'error.main', ml: '2px' }}>
            *
          </Box>
        </Typography>
        <Controller
          name="customerType"
          control={control}
          render={({ field }) => (
            <RadioGroup row {...field}>
              <FormControlLabel
                value="business"
                control={<Radio />}
                label={
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                    Business
                  </Typography>
                }
              />
              <FormControlLabel
                value="residential"
                control={<Radio />}
                label={
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                    Residential
                  </Typography>
                }
              />
            </RadioGroup>
          )}
        />
      </FormControl>

      {/* Conditional Customer Fields */}
      {customerType === 'business' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Business Name"
            error={!!errors.businessName}
            helperText={errors.businessName?.message}
            {...register('businessName')}
          />
          <TextField
            fullWidth
            label="Primary Contact Name"
            error={!!errors.primaryContactName}
            helperText={errors.primaryContactName?.message}
            {...register('primaryContactName')}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Phone"
                error={!!errors.contactPhone}
                helperText={errors.contactPhone?.message}
                {...register('contactPhone')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                error={!!errors.contactEmail}
                helperText={errors.contactEmail?.message}
                {...register('contactEmail')}
              />
            </Grid>
          </Grid>
        </Stack>
      )}

      {customerType === 'residential' && (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Full Name"
            error={!!errors.residentName}
            helperText={errors.residentName?.message}
            {...register('residentName')}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                error={!!errors.residentPhone}
                helperText={errors.residentPhone?.message}
                {...register('residentPhone')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                error={!!errors.residentEmail}
                helperText={errors.residentEmail?.message}
                {...register('residentEmail')}
              />
            </Grid>
          </Grid>
        </Stack>
      )}

      {/* Invoice Address */}
      <Box>
        <Controller
          name="invoiceAddressSameAsService"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label={
                <Typography variant="subtitle2" color="text.secondary">
                  Invoice address same as service location
                </Typography>
              }
            />
          )}
        />

        {!sameAsServiceLocation && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Invoice Street Address"
              error={!!errors.invoiceStreet}
              helperText={errors.invoiceStreet?.message}
              {...register('invoiceStreet')}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  error={!!errors.invoiceCity}
                  helperText={errors.invoiceCity?.message}
                  {...register('invoiceCity')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="State"
                  error={!!errors.invoiceState}
                  helperText={errors.invoiceState?.message}
                  {...register('invoiceState')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="ZIP"
                  error={!!errors.invoiceZip}
                  helperText={errors.invoiceZip?.message}
                  {...register('invoiceZip')}
                />
              </Grid>
            </Grid>
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default ServiceOverview;
