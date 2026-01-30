'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Grid,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import {
  coveredEquipment,
  getEquipmentByAgreement,
  equipmentCategories,
  equipmentStatuses,
} from 'data/service-agreements/equipment';

const CoveredEquipment = ({ agreementId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const equipment = getEquipmentByAgreement(agreementId);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Covered Equipment</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<IconifyIcon icon="material-symbols:add" />}
          onClick={() => setOpenDialog(true)}
        >
          Add Equipment
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {equipment.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <IconifyIcon
                        icon={equipmentCategories[item.category].icon}
                        width={20}
                      />
                      <Typography variant="subtitle2">{item.manufacturer} {item.model}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      S/N: {item.serialNumber}
                    </Typography>
                  </Box>
                  <Chip
                    label={equipmentStatuses[item.status].label}
                    size="small"
                    sx={{
                      bgcolor: `${equipmentStatuses[item.status].color}15`,
                      color: equipmentStatuses[item.status].color,
                    }}
                  />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconifyIcon icon="material-symbols:location-on-outline" width={16} />
                      <Typography variant="caption">{item.location}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Installed
                    </Typography>
                    <Typography variant="body2">
                      {new Date(item.installDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Warranty Ends
                    </Typography>
                    <Typography variant="body2">
                      {new Date(item.warrantyEndDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last Maintenance
                    </Typography>
                    <Typography variant="body2">
                      {new Date(item.lastMaintenanceDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Next Maintenance
                    </Typography>
                    <Typography variant="body2" color="primary.main">
                      {new Date(item.nextMaintenanceDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>

                {item.notes && (
                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Notes:
                    </Typography>
                    <Typography variant="body2" fontSize="0.8rem">
                      {item.notes}
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={1} mt={2}>
                  <Button
                    size="small"
                    startIcon={<IconifyIcon icon="material-symbols:history" />}
                    fullWidth
                  >
                    Service History
                  </Button>
                  <Button
                    size="small"
                    startIcon={<IconifyIcon icon="material-symbols:edit" />}
                    fullWidth
                  >
                    Edit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {equipment.length === 0 && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: 'background.default',
              }}
            >
              <IconifyIcon
                icon="material-symbols:precision-manufacturing-outline"
                width={48}
                color="text.secondary"
              />
              <Typography variant="h6" color="text.secondary" mt={2}>
                No Equipment Added
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add equipment to track maintenance and warranty information
              </Typography>
              <Button variant="contained" onClick={() => setOpenDialog(true)}>
                Add First Equipment
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CoveredEquipment;
