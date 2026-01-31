import { useFormContext } from 'react-hook-form';
import {
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import EventFileDropHandler from 'components/sections/service/create-ticket/EventFileDropHandler';

const ServiceDeviceSection = ({ sectionIndex }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const handlePlaceOnMap = () => {
    // Placeholder for future site map integration
    console.log('Open site map drawer - Phase 4 feature');
  };

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
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Device Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Device Name"
            error={!!errors?.sections?.[sectionIndex]?.deviceName}
            helperText={errors?.sections?.[sectionIndex]?.deviceName?.message}
            {...register(`sections.${sectionIndex}.deviceName`)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Make / Model"
            error={!!errors?.sections?.[sectionIndex]?.makeModel}
            helperText={errors?.sections?.[sectionIndex]?.makeModel?.message}
            {...register(`sections.${sectionIndex}.makeModel`)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Serial Number"
            error={!!errors?.sections?.[sectionIndex]?.serialNumber}
            helperText={errors?.sections?.[sectionIndex]?.serialNumber?.message}
            {...register(`sections.${sectionIndex}.serialNumber`)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              label="Location"
              placeholder="e.g., Front entrance, Bedroom 2"
              error={!!errors?.sections?.[sectionIndex]?.deviceLocation}
              helperText={errors?.sections?.[sectionIndex]?.deviceLocation?.message}
              {...register(`sections.${sectionIndex}.deviceLocation`)}
            />
            <Button
              variant="outlined"
              color="neutral"
              onClick={handlePlaceOnMap}
              startIcon={<IconifyIcon icon="material-symbols:location-on-outline" />}
              sx={{ flexShrink: 0 }}
            >
              Map
            </Button>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 2, mt: 2 }}>
            Work Performed
          </Typography>
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Work Performed on Device"
            error={!!errors?.sections?.[sectionIndex]?.deviceWorkPerformed}
            helperText={errors?.sections?.[sectionIndex]?.deviceWorkPerformed?.message}
            {...register(`sections.${sectionIndex}.deviceWorkPerformed`)}
          />
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

export default ServiceDeviceSection;
