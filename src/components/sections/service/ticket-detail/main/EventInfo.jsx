import { Avatar, Box, Link, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';

const EventInfo = ({ eventInfo }) => {
  return (
    <Box
      sx={{
        pt: { xs: 3, md: 5 },
        pb: 5,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        {eventInfo.title}
      </Typography>

      <Paper
        background={1}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 6,
        }}
      >
        <Grid container spacing={4}>
          {/* Left Column - 60% */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3}>
              {/* Scheduled Date/Time */}
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconifyIcon
                    icon="material-symbols:calendar-today-outline"
                    sx={{ fontSize: 20, color: 'primary.main' }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Scheduled Service
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ ml: 3.5 }}>
                  {eventInfo.date}
                </Typography>
              </Stack>

              {/* Service Window */}
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconifyIcon
                    icon="material-symbols:schedule-outline"
                    sx={{ fontSize: 20, color: 'primary.main' }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Service Window
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ ml: 3.5 }}>
                  {eventInfo.startTime} - {eventInfo.endTime}
                </Typography>
              </Stack>

              {/* Physical Address */}
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconifyIcon
                    icon="material-symbols:location-on-outline"
                    sx={{ fontSize: 20, color: 'primary.main' }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Service Location
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                  {eventInfo.location}
                </Typography>
                {eventInfo.mapLink && (
                  <Link
                    variant="body2"
                    href={eventInfo.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontWeight: 600,
                      ml: 3.5,
                      display: 'inline-block',
                    }}
                  >
                    Show in map
                  </Link>
                )}
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column - 40% */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              {/* Section Heading */}
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Customer Information
              </Typography>

              {/* Customer Type */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                  Customer Type
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {eventInfo.customerType || 'Business'}
                </Typography>
              </Stack>

              {/* Business Name */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                  Business Name
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{ bgcolor: 'success.main', width: 48, height: 48 }}
                    alt={eventInfo.organizerName}
                  >
                    {eventInfo.organizerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6">
                    {eventInfo.organizerName}
                  </Typography>
                </Stack>
              </Stack>

              {/* Contact Information */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                  Contact Information
                </Typography>
                <Stack spacing={1}>
                  <Link
                    href={`tel:${eventInfo.phone || '+1-555-123-4567'}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <IconifyIcon icon="material-symbols:phone-outline" sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">{eventInfo.phone || '+1-555-123-4567'}</Typography>
                  </Link>
                  <Link
                    href={`mailto:${eventInfo.email || 'service@acmesecurity.com'}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    <IconifyIcon icon="material-symbols:mail-outline" sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">{eventInfo.email || 'service@acmesecurity.com'}</Typography>
                  </Link>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EventInfo;
