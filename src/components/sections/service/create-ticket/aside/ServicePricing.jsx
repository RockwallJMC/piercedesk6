import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  Box,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import NumberTextField from 'components/base/NumberTextField';

const ServicePricing = ({ handleClose }) => {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const pricingType = useWatch({
    control,
    name: 'servicePricing.pricingType',
  });

  const baseCharge = watch('servicePricing.baseCharge') || 0;
  const hourlyRate = watch('servicePricing.hourlyRate') || 0;
  const minimumHours = watch('servicePricing.minimumHours') || 0;
  const tripCharge = watch('servicePricing.tripCharge') || 0;

  const calculateEstimate = () => {
    if (pricingType === 'quote') {
      return { min: 0, max: 0 };
    }

    const baseCost = Number(baseCharge) + Number(tripCharge);
    const laborMin = Number(hourlyRate) * Number(minimumHours);
    const laborMax = Number(hourlyRate) * (Number(minimumHours) + 2); // Estimate +2 hours

    return {
      min: baseCost + laborMin,
      max: baseCost + laborMax,
    };
  };

  const estimate = calculateEstimate();

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      <Stack justifyContent="space-between" mb={3}>
        <Typography variant="h6">Service Pricing</Typography>

        {handleClose && (
          <Button shape="circle" variant="soft" color="neutral" onClick={handleClose}>
            <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
          </Button>
        )}
      </Stack>

      <Stack direction="column" spacing={3}>
        <Controller
          name="servicePricing.pricingType"
          control={control}
          render={({ field }) => (
            <RadioGroup {...field}>
              <FormControlLabel
                value="quote"
                control={<Radio />}
                label={
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                    Quote Required
                  </Typography>
                }
              />
              <FormControlLabel
                value="fixed"
                control={<Radio />}
                label={
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                    Fixed Price
                  </Typography>
                }
              />
              <FormControlLabel
                value="time_materials"
                control={<Radio />}
                label={
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                    Time & Materials
                  </Typography>
                }
              />
              <FormControlLabel
                value="contract"
                control={<Radio />}
                label={
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                    Contract/Scheduled Maintenance
                  </Typography>
                }
              />
            </RadioGroup>
          )}
        />

        {(pricingType === 'fixed' || pricingType === 'time_materials') && (
          <Stack direction="column" spacing={2}>
            <NumberTextField
              fullWidth
              label="Base Service Charge"
              placeholder="$0.00"
              error={!!errors.servicePricing?.baseCharge}
              helperText={errors.servicePricing?.baseCharge?.message}
              {...register('servicePricing.baseCharge', {
                setValueAs: (value) => Number(value),
              })}
            />

            <NumberTextField
              fullWidth
              label="Hourly Rate"
              placeholder="$0.00"
              error={!!errors.servicePricing?.hourlyRate}
              helperText={errors.servicePricing?.hourlyRate?.message}
              {...register('servicePricing.hourlyRate', {
                setValueAs: (value) => Number(value),
              })}
            />

            <NumberTextField
              fullWidth
              label="Minimum Hours"
              error={!!errors.servicePricing?.minimumHours}
              helperText={errors.servicePricing?.minimumHours?.message}
              {...register('servicePricing.minimumHours', {
                setValueAs: (value) => Number(value),
              })}
            />

            <NumberTextField
              fullWidth
              label="Trip Charge"
              placeholder="$0.00"
              error={!!errors.servicePricing?.tripCharge}
              helperText={errors.servicePricing?.tripCharge?.message}
              {...register('servicePricing.tripCharge', {
                setValueAs: (value) => Number(value),
              })}
            />

            <NumberTextField
              fullWidth
              label="Parts Markup %"
              placeholder="0"
              error={!!errors.servicePricing?.partsMarkup}
              helperText={errors.servicePricing?.partsMarkup?.message || 'Percentage markup on parts'}
              {...register('servicePricing.partsMarkup', {
                setValueAs: (value) => Number(value),
              })}
            />

            {estimate.min > 0 && (
              <Tooltip
                title={`Trip: $${tripCharge} + Base: $${baseCharge} + Labor: ${minimumHours}h @ $${hourlyRate}/h`}
              >
                <TextField
                  fullWidth
                  label="Estimated Range"
                  value={`$${estimate.min.toFixed(2)} - $${estimate.max.toFixed(2)}`}
                  variant="filled"
                  disabled
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                />
              </Tooltip>
            )}
          </Stack>
        )}

        {pricingType === 'quote' && (
          <Typography variant="body2" color="text.secondary">
            No pricing shown to customer. Quote will be provided after assessment.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default ServicePricing;
