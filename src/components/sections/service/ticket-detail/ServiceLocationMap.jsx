'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

// Phase 4: Mapbox integration placeholder
// Note: react-map-gl has path resolution issues with Next.js jsconfig wildcard alias
// For now, using static placeholder - full integration requires jsconfig adjustment
const MapPlaceholder = ({ location, address }) => (
  <Box
    sx={{
      width: 1,
      height: 300,
      borderRadius: 6,
      bgcolor: 'grey.200',
      position: 'relative',
      backgroundImage: location?.latitude
        ? `url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l-marker+ff0000(${location.longitude},${location.latitude})/${location.longitude},${location.latitude},${location.zoom || 15},0/600x300@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN})`
        : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    {address && (
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconifyIcon
            icon="material-symbols:location-on-outline"
            sx={{ fontSize: 20, color: 'primary.main' }}
          />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {address}
          </Typography>
        </Stack>
      </Paper>
    )}
  </Box>
);

const ServiceLocationMap = ({ location, address }) => {
  // Use static map API for Phase 4 due to build issues with react-map-gl
  // Interactive map can be added in future phase after jsconfig path alias fix
  return <MapPlaceholder location={location} address={address} />;
};

export default ServiceLocationMap;
