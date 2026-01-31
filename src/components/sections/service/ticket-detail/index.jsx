'use client';

import { useState } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import { eventInfo } from 'data/service-tickets';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import ScrollSpy from 'components/scroll-spy';
import EventOrganizer from 'components/sections/service/ticket-detail/EventOrganizer';
import EventsTabPanel from 'components/sections/service/ticket-detail/EventsTabPanel';
import TicketPurchaseDrawer from 'components/sections/service/ticket-detail/TicketPurchaseDrawer';
import TicketPurchaseToolbar from 'components/sections/service/ticket-detail/TicketPurchaseToolbar';
import EventInfo from 'components/sections/service/ticket-detail/main/EventInfo';

const TicketDetail = () => {
  const [openPurchaseTicketDrawer, setOpenPurchaseTicketDrawer] = useState(false);
  const { up } = useBreakpoints();
  const upXl = up('xl');

  return (
    <ScrollSpy offset={600}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, p: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            width: 1,
            height: 300,
            borderRadius: 6,
            bgcolor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack spacing={1} alignItems="center">
            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Service Location Map
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Mapbox integration - Phase 4
            </Typography>
          </Stack>
        </Box>

        <EventInfo eventInfo={eventInfo} />

        <Container maxWidth={upXl ? false : 'sm'} sx={{ px: { xs: 0 } }}>
          <EventsTabPanel />
        </Container>

        <EventOrganizer />
      </Container>

      <TicketPurchaseToolbar onPurchaseClick={() => setOpenPurchaseTicketDrawer(true)} />
      <TicketPurchaseDrawer
        open={openPurchaseTicketDrawer}
        handleClose={() => setOpenPurchaseTicketDrawer(false)}
      />
    </ScrollSpy>
  );
};

export default TicketDetail;
