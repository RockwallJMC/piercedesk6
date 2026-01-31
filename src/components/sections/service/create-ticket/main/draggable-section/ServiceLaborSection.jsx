import { Fragment } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { TimePicker } from '@mui/x-date-pickers';
import IconifyIcon from 'components/base/IconifyIcon';
import NumberTextField from 'components/base/NumberTextField';

const ServiceLaborSection = ({ sectionIndex }) => {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.helperTechs`,
  });

  const addHelperTech = () => {
    append({
      name: '',
      techId: `helper${fields.length + 1}`,
    });
  };

  const calculateHours = (arrivalTime, departureTime) => {
    if (!arrivalTime || !departureTime) return '0.00';

    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    const diffMs = departure - arrival;
    const hours = diffMs / (1000 * 60 * 60);

    return hours > 0 ? hours.toFixed(2) : '0.00';
  };

  const calculateLaborCost = (hours, hourlyRate) => {
    const hrs = Number(hours) || 0;
    const rate = Number(hourlyRate) || 0;
    return (hrs * rate).toFixed(2);
  };

  const arrivalTime = watch(`sections.${sectionIndex}.arrivalTime`);
  const departureTime = watch(`sections.${sectionIndex}.departureTime`);
  const hourlyRate = watch(`sections.${sectionIndex}.hourlyRate`) || 0;
  const totalHours = calculateHours(arrivalTime, departureTime);
  const laborCost = calculateLaborCost(totalHours, hourlyRate);

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 6,
        outline: 'none',
      }}
    >
      <Grid container spacing={3}>
        {/* Time Tracking */}
        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Time Tracking
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            control={control}
            name={`sections.${sectionIndex}.arrivalTime`}
            render={({ field }) => (
              <TimePicker
                label="Arrival Time"
                value={field.value ?? null}
                onChange={field.onChange}
                slotProps={{
                  inputAdornment: {
                    position: 'start',
                  },
                  textField: {
                    fullWidth: true,
                    error: !!errors?.sections?.[sectionIndex]?.arrivalTime,
                    helperText: errors?.sections?.[sectionIndex]?.arrivalTime?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            control={control}
            name={`sections.${sectionIndex}.departureTime`}
            render={({ field }) => (
              <TimePicker
                label="Departure Time"
                value={field.value ?? null}
                onChange={field.onChange}
                slotProps={{
                  inputAdornment: {
                    position: 'start',
                  },
                  textField: {
                    fullWidth: true,
                    error: !!errors?.sections?.[sectionIndex]?.departureTime,
                    helperText: errors?.sections?.[sectionIndex]?.departureTime?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Total Hours"
            value={totalHours}
            variant="filled"
            disabled
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>

        {/* Lead Technician */}
        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 2, mt: 2 }}>
            Technicians
          </Typography>
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label="Lead Technician"
            variant="filled"
            error={!!errors?.sections?.[sectionIndex]?.leadTech}
            helperText={errors?.sections?.[sectionIndex]?.leadTech?.message}
            {...register(`sections.${sectionIndex}.leadTech`)}
          />
        </Grid>

        {/* Helper Technicians */}
        <Grid size={12}>
          <Box>
            {fields.map((field, index) => (
              <Fragment key={field.id}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Helper Technician ${index + 1}`}
                    variant="filled"
                    error={!!errors?.sections?.[sectionIndex]?.helperTechs?.[index]?.name}
                    helperText={errors?.sections?.[sectionIndex]?.helperTechs?.[index]?.name?.message}
                    {...register(`sections.${sectionIndex}.helperTechs.${index}.name`)}
                  />
                  <IconButton color="error" onClick={() => remove(index)}>
                    <IconifyIcon icon="material-symbols:delete-outline-rounded" fontSize={20} />
                  </IconButton>
                </Stack>
              </Fragment>
            ))}

            <Button
              onClick={addHelperTech}
              variant="text"
              size="small"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" height={18} width={18} />}
              sx={{
                px: '5px',
                mb: 2,
              }}
            >
              Add Helper Tech
            </Button>
          </Box>
        </Grid>

        {/* Labor Cost Calculation */}
        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 2, mt: 2 }}>
            Labor Cost
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberTextField
            fullWidth
            label="Hourly Rate"
            placeholder="$0.00"
            variant="filled"
            error={!!errors?.sections?.[sectionIndex]?.hourlyRate}
            helperText={errors?.sections?.[sectionIndex]?.hourlyRate?.message}
            {...register(`sections.${sectionIndex}.hourlyRate`, {
              setValueAs: (value) => Number(value),
            })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Total Labor Cost"
            value={`$${laborCost}`}
            variant="filled"
            disabled
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServiceLaborSection;
