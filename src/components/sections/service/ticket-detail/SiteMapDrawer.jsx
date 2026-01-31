'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { drawerClasses } from '@mui/material/Drawer';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';

const SiteMapDrawer = ({ open, handleClose, siteMaps = [], onMarkerPlace }) => {
  const [activeMapIndex, setActiveMapIndex] = useState(0);
  const [markers, setMarkers] = useState([]);

  const handleMapClick = (event) => {
    if (!onMarkerPlace) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newMarker = {
      id: `marker-${Date.now()}`,
      x,
      y,
      mapIndex: activeMapIndex,
    };

    setMarkers([...markers, newMarker]);
    onMarkerPlace?.(newMarker);
  };

  const handlePrevMap = () => {
    setActiveMapIndex((prev) => (prev > 0 ? prev - 1 : siteMaps.length - 1));
  };

  const handleNextMap = () => {
    setActiveMapIndex((prev) => (prev < siteMaps.length - 1 ? prev + 1 : 0));
  };

  const currentMap = siteMaps[activeMapIndex] || {
    name: 'Site Map',
    image: '/placeholder-site-map.svg',
  };

  const currentMarkers = markers.filter((m) => m.mapIndex === activeMapIndex);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={(theme) => ({
        [`& .${drawerClasses.paper}`]: {
          maxWidth: 800,
          width: 1,
          bgcolor: 'background.elevation1',
        },
        zIndex: theme.zIndex.drawer + 2,
      })}
    >
      <Box
        sx={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            pt: 5,
            px: { xs: 3, sm: 5 },
            pb: 3,
          }}
        >
          <Stack sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Site Maps</Typography>
            <IconButton onClick={handleClose}>
              <IconifyIcon icon="material-symbols:close" fontSize={20} />
            </IconButton>
          </Stack>

          {/* Map Navigation */}
          {siteMaps.length > 1 && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <IconButton onClick={handlePrevMap} size="small">
                <IconifyIcon icon="material-symbols:chevron-left-rounded" fontSize={24} />
              </IconButton>
              <Typography variant="subtitle1" sx={{ minWidth: 200, textAlign: 'center' }}>
                {currentMap.name} ({activeMapIndex + 1} / {siteMaps.length})
              </Typography>
              <IconButton onClick={handleNextMap} size="small">
                <IconifyIcon icon="material-symbols:chevron-right-rounded" fontSize={24} />
              </IconButton>
            </Stack>
          )}
        </Box>

        {/* Map Display Area */}
        <SimpleBar sx={{ minHeight: 0, flex: 1, height: 1 }}>
          <Box sx={{ px: { xs: 3, sm: 5 }, pb: 5 }}>
            <Paper
              sx={{
                position: 'relative',
                width: '100%',
                height: 600,
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'background.elevation2',
                cursor: onMarkerPlace ? 'crosshair' : 'default',
              }}
              onClick={handleMapClick}
            >
              {/* Placeholder for site map image/SVG */}
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.200',
                  backgroundImage: currentMap.image
                    ? `url(${currentMap.image})`
                    : 'none',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {!currentMap.image && (
                  <Stack spacing={2} alignItems="center">
                    <IconifyIcon
                      icon="material-symbols:map-outline"
                      sx={{ fontSize: 80, color: 'text.disabled' }}
                    />
                    <Typography variant="h6" color="text.secondary">
                      {currentMap.name}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Click to place device markers
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Device Markers */}
              {currentMarkers.map((marker) => (
                <Box
                  key={marker.id}
                  sx={{
                    position: 'absolute',
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                  }}
                >
                  <IconifyIcon
                    icon="material-symbols:location-on"
                    sx={{
                      fontSize: 32,
                      color: 'primary.main',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }}
                  />
                </Box>
              ))}
            </Paper>

            {/* Instructions */}
            <Paper
              background={1}
              sx={{
                mt: 3,
                p: 3,
                borderRadius: 3,
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Instructions
                </Typography>
                <Stack component="ul" spacing={1} sx={{ pl: 2, m: 0 }}>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Click anywhere on the map to place a device marker
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Use forward/backward buttons to navigate between floors or areas
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Markers are saved automatically when placed
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        </SimpleBar>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 3, sm: 5 },
            pb: 5,
            pt: 3,
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.elevation1',
          }}
        >
          <Button fullWidth variant="contained" color="primary" onClick={handleClose}>
            Done
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SiteMapDrawer;
