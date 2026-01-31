import { Controller, useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Editor from 'components/base/Editor';
import NumberTextField from 'components/base/NumberTextField';
import EventFileDropHandler from 'components/sections/service/create-ticket/EventFileDropHandler';

const activityTypes = [
  'Inspection',
  'Repair',
  'Installation',
  'Testing',
  'Maintenance',
  'Diagnostic',
  'Upgrade',
  'Emergency Service',
];

const ServiceActivitySection = ({ sectionIndex }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 6,
        outline: 'none',
      }}
    >
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            fullWidth
            label="Activity Name"
            error={!!errors?.sections?.[sectionIndex]?.activityName}
            helperText={errors?.sections?.[sectionIndex]?.activityName?.message}
            {...register(`sections.${sectionIndex}.activityName`)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Activity Type"
            error={!!errors?.sections?.[sectionIndex]?.activityType}
            helperText={errors?.sections?.[sectionIndex]?.activityType?.message}
            {...register(`sections.${sectionIndex}.activityType`)}
          >
            {activityTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <NumberTextField
            fullWidth
            label="Duration Estimate (hours)"
            error={!!errors?.sections?.[sectionIndex]?.durationEstimate}
            helperText={errors?.sections?.[sectionIndex]?.durationEstimate?.message}
            {...register(`sections.${sectionIndex}.durationEstimate`, {
              setValueAs: (value) => Number(value),
            })}
          />
        </Grid>

        <Grid size={12}>
          <FormControl
            variant="filled"
            fullWidth
            error={!!errors?.sections?.[sectionIndex]?.activityDescription}
          >
            <Controller
              name={`sections.${sectionIndex}.activityDescription`}
              control={control}
              render={({ field }) => (
                <Editor
                  onChange={field.onChange}
                  content={field.value}
                  isValid={!errors?.sections?.[sectionIndex]?.activityDescription}
                />
              )}
            />
            <FormHelperText>
              {errors?.sections?.[sectionIndex]?.activityDescription?.message}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Stack direction="column" spacing={2}>
            <EventFileDropHandler imagesField={`sections.${sectionIndex}.images`} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServiceActivitySection;
