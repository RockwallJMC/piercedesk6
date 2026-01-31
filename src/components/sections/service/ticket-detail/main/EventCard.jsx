'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

const EventCard = ({ event, sx }) => {
  const { title, image, priceRange, date, time, location } = event;
  const { enqueueSnackbar } = useSnackbar();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsFavorited(!isFavorited);

    enqueueSnackbar(
      isFavorited ? 'Removed from favorites' : 'Saved to favorites',
      {
        variant: isFavorited ? 'info' : 'success',
        autoHideDuration: 2000,
      }
    );
  };

  return (
    <Link href="#!">
      <Card sx={{ outline: 'none', bgcolor: 'background.elevation1', ...sx }}>
        <CardMedia>
          <Image
            src={image}
            alt={title}
            height={200}
            width={300}
            sx={{ objectFit: 'cover', width: 1, borderRadius: 6 }}
          />
        </CardMedia>

        <CardContent sx={{ p: 3 }}>
          <Stack direction="column" spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {priceRange}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </Typography>

            <Stack alignItems="flex-end" justifyContent="space-between">
              <div>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
                    {date}
                  </Typography>
                  <Typography variant="subtitle2" color="warning.main">
                    {time}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <IconifyIcon
                    icon="material-symbols:location-on-outline"
                    fontSize={20}
                    color="primary.dark"
                  />
                  {location}
                </Typography>
              </div>
              <IconButton
                edge="start"
                aria-label="favourite"
                onClick={handleToggleFavorite}
                sx={{
                  color: isFavorited ? 'error.main' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: 'error.main',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <IconifyIcon
                  icon={
                    isFavorited
                      ? 'material-symbols:favorite-rounded'
                      : 'material-symbols:favorite-outline-rounded'
                  }
                  width={20}
                  height={20}
                />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
