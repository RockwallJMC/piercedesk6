import { Controller, useFormContext } from 'react-hook-form';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Editor from 'components/base/Editor';

const instructionTypes = [
  'Site Access',
  'Customer Notes',
  'Safety Requirements',
  'Special Instructions',
  'Equipment Needed',
  'Parking Information',
];

const ServiceNotesSection = ({ sectionIndex }) => {
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
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Instruction Type"
            defaultValue="Customer Notes"
            error={!!errors?.sections?.[sectionIndex]?.instructionType}
            helperText={errors?.sections?.[sectionIndex]?.instructionType?.message}
            {...register(`sections.${sectionIndex}.instructionType`)}
          >
            {instructionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={`sections.${sectionIndex}.isPriority`}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value || false} />}
                label={
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority Flag (Important)
                  </Typography>
                }
                sx={{ mt: 1.5 }}
              />
            )}
          />
        </Grid>

        <Grid size={12}>
          <FormControl
            variant="filled"
            fullWidth
            error={!!errors?.sections?.[sectionIndex]?.notesContent}
          >
            <Controller
              name={`sections.${sectionIndex}.notesContent`}
              control={control}
              render={({ field }) => (
                <Editor
                  onChange={field.onChange}
                  content={field.value}
                  isValid={!errors?.sections?.[sectionIndex]?.notesContent}
                />
              )}
            />
            <FormHelperText>
              {errors?.sections?.[sectionIndex]?.notesContent?.message}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServiceNotesSection;
