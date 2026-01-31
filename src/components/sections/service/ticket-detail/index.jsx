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
import ServiceLocationMap from 'components/sections/service/ticket-detail/ServiceLocationMap';

const TicketDetail = () => {
  const [openPurchaseTicketDrawer, setOpenPurchaseTicketDrawer] = useState(false);
  const { up } = useBreakpoints();
  const upXl = up('xl');

  return (
    <ScrollSpy offset={600}>
      <Container maxWidth={false} sx={{ maxWidth: 1280, p: { xs: 3, md: 5 } }}>
        <ServiceLocationMap
          location={eventInfo.serviceLocation}
          address={eventInfo.serviceLocation?.address}
        />

        <EventInfo eventInfo={eventInfo} />

        <Container maxWidth={upXl ? false : 'sm'} sx={{ px: { xs: 0 } }}>
          <EventsTabPanel />
        </Container>

        <EventOrganizer />
      </Container>

      <TicketPurchaseToolbar
        onPurchaseClick={() => setOpenPurchaseTicketDrawer(true)}
        ticketStatus={eventInfo.status}
      />
      <TicketPurchaseDrawer
        open={openPurchaseTicketDrawer}
        handleClose={() => setOpenPurchaseTicketDrawer(false)}
      />
    </ScrollSpy>
  );
};

export default TicketDetail;
