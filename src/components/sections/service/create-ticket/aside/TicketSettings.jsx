import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';

const priorityLevels = ['Low', 'Normal', 'High', 'Emergency'];
const statusOptions = ['Draft', 'Scheduled', 'In Progress', 'Completed', 'Paid', 'Cancelled'];

const TicketSettings = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Ticket Settings
      </Typography>

      <Stack direction="column" spacing={3}>
        {/* Visibility */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Visibility
          </Typography>
          <Controller
            name="ticketSettings.visibility"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <FormControlLabel
                  value="internal"
                  control={<Radio />}
                  label={
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                      Internal Only
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="customer"
                  control={<Radio />}
                  label={
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                      Customer Portal Visible
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="public"
                  control={<Radio />}
                  label={
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={400}>
                      Public (Service Request Form)
                    </Typography>
                  }
                />
              </RadioGroup>
            )}
          />
        </Box>

        {/* Priority */}
        <TextField
          fullWidth
          select
          label="Priority"
          error={!!errors.ticketSettings?.priority}
          helperText={errors.ticketSettings?.priority?.message}
          {...register('ticketSettings.priority')}
        >
          {priorityLevels.map((level) => (
            <MenuItem key={level} value={level.toLowerCase()}>
              {level}
            </MenuItem>
          ))}
        </TextField>

        {/* Assigned Tech */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Assigned Technician
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Tech Name"
              error={!!errors.ticketSettings?.assignedTech?.name}
              helperText={errors.ticketSettings?.assignedTech?.name?.message}
              {...register('ticketSettings.assignedTech.name')}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  error={!!errors.ticketSettings?.assignedTech?.phone}
                  helperText={errors.ticketSettings?.assignedTech?.phone?.message}
                  {...register('ticketSettings.assignedTech.phone')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.ticketSettings?.assignedTech?.email}
                  helperText={errors.ticketSettings?.assignedTech?.email?.message}
                  {...register('ticketSettings.assignedTech.email')}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Vehicle Make/Model"
                  error={!!errors.ticketSettings?.assignedTech?.vehicle?.makeModel}
                  helperText={errors.ticketSettings?.assignedTech?.vehicle?.makeModel?.message}
                  {...register('ticketSettings.assignedTech.vehicle.makeModel')}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  placeholder="e.g., Truck #12"
                  error={!!errors.ticketSettings?.assignedTech?.vehicle?.number}
                  helperText={errors.ticketSettings?.assignedTech?.vehicle?.number?.message}
                  {...register('ticketSettings.assignedTech.vehicle.number')}
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Status */}
        <TextField
          fullWidth
          select
          label="Status"
          error={!!errors.ticketSettings?.status}
          helperText={errors.ticketSettings?.status?.message}
          {...register('ticketSettings.status')}
        >
          {statusOptions.map((status) => (
            <MenuItem key={status} value={status.toLowerCase().replace(/ /g, '_')}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Box>
  );
};

export default TicketSettings;
