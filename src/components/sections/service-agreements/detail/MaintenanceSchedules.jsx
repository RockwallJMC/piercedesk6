'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  maintenanceSchedules,
  getSchedulesByAgreement,
  scheduleFrequencies,
  scheduleStatuses,
} from 'data/service-agreements/schedules';

const MaintenanceSchedules = ({ agreementId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const schedules = getSchedulesByAgreement(agreementId);

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Maintenance Schedules</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconifyIcon icon="material-symbols:add" />}
          onClick={() => setOpenDialog(true)}
        >
          Create Schedule
        </Button>
      </Stack>

      <Paper>
        <List>
          {schedules.map((schedule, index) => {
            const overdueFlag = isOverdue(schedule.nextDueDate);
            return (
              <Box key={schedule.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={2} alignItems="center">
                        <IconifyIcon
                          icon={
                            schedule.status === 'active'
                              ? 'material-symbols:check-circle'
                              : 'material-symbols:pause-circle'
                          }
                          color={schedule.status === 'active' ? 'success.main' : 'warning.main'}
                        />
                        <Typography variant="subtitle2">{schedule.name}</Typography>
                        <Chip
                          label={scheduleFrequencies[schedule.frequency].label}
                          size="small"
                          variant="outlined"
                        />
                        {overdueFlag && (
                          <Chip label="OVERDUE" size="small" color="error" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {schedule.description}
                        </Typography>
                        <Stack direction="row" spacing={3} mt={1}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Next Due
                            </Typography>
                            <Typography
                              variant="body2"
                              color={overdueFlag ? 'error.main' : 'primary.main'}
                              fontWeight={500}
                            >
                              {new Date(schedule.nextDueDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Assigned To
                            </Typography>
                            <Typography variant="body2">
                              {schedule.assignedTechnician.name}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Est. Hours
                            </Typography>
                            <Typography variant="body2">
                              {schedule.estimatedHours}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Equipment
                            </Typography>
                            <Typography variant="body2">
                              {schedule.equipmentIds.length} item(s)
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small">
                        <IconifyIcon icon="material-symbols:play-arrow" />
                      </IconButton>
                      <IconButton size="small">
                        <IconifyIcon icon="material-symbols:edit" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <IconifyIcon icon="material-symbols:delete-outline" />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            );
          })}
        </List>

        {schedules.length === 0 && (
          <Box p={6} textAlign="center" bgcolor="background.default">
            <IconifyIcon
              icon="material-symbols:calendar-month-outline"
              width={48}
              color="text.secondary"
            />
            <Typography variant="h6" color="text.secondary" mt={2}>
              No Schedules Created
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create maintenance schedules to automate recurring service tickets
            </Typography>
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
              Create First Schedule
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MaintenanceSchedules;
