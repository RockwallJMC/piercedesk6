'use client';

import { Avatar, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const EventOrganizerInfo = ({ organizer }) => {
  return (
    <Paper
      background={1}
      component={Stack}
      sx={{
        outline: 'none',
        flexDirection: 'column',
        gap: 3,
        borderRadius: 6,
        p: 3,
        height: 1,
      }}
    >
      <Stack direction="column" gap={3}>
        <Typography variant="h6" sx={{ lineHeight: 1.5 }}>
          Lead Technician
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row', xl: 'column' }} rowGap={3} columnGap={4}>
          <Stack alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
              {organizer.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {organizer.name}
              </Typography>
            </div>
          </Stack>

          <Divider
            flexItem
            orientation="vertical"
            sx={{ display: { xs: 'none', sm: 'block', xl: 'none' } }}
          />

          <div>
            <Stack gap={1} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: 'background.elevation2', width: 24, height: 24 }}>
                <IconifyIcon
                  icon="material-symbols:call-outline-rounded"
                  fontSize={16}
                  color="text.secondary"
                />
              </Avatar>
              <Link href={`tel:${organizer.phone}`} variant="caption" color="text.secondary">
                {organizer.phone}
              </Link>
            </Stack>

            <Stack gap={1} alignItems="center">
              <Avatar sx={{ bgcolor: 'background.elevation2', width: 24, height: 24 }}>
                <IconifyIcon
                  icon="material-symbols:mail-outline-rounded"
                  fontSize={16}
                  color="text.secondary"
                />
              </Avatar>
              <Link href={`mailto:${organizer.email}`} variant="caption" color="text.secondary">
                {organizer.email}
              </Link>
            </Stack>
          </div>
        </Stack>

        {/* Vehicle Info */}
        {organizer.vehicle && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>
              Vehicle Information
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconifyIcon icon="material-symbols:local-shipping-outline" fontSize={16} color="text.secondary" />
              <Typography variant="body2" color="text.secondary">
                {organizer.vehicle.make} {organizer.vehicle.model}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              {organizer.vehicle.vehicleNumber}
            </Typography>
          </Stack>
        )}

        {/* Helper Technicians */}
        {organizer.helpers && organizer.helpers.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.disabled" sx={{ textTransform: 'uppercase' }}>
              Helper Technicians
            </Typography>
            {organizer.helpers.map((helper, index) => (
              <Stack key={index} spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {helper.name}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Link href={`tel:${helper.phone}`} variant="caption" color="text.secondary">
                    {helper.phone}
                  </Link>
                  <Link href={`mailto:${helper.email}`} variant="caption" color="text.secondary">
                    {helper.email}
                  </Link>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default EventOrganizerInfo;
