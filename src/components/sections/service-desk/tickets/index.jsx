'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import SimpleBar from 'components/base/SimpleBar';
import ServiceTicketsHeader from './ServiceTicketsHeader';
import ServiceTicketsList from './ServiceTicketsList';

const ServiceDeskTickets = () => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upSm = up('sm');

  return (
    <Paper>
      <ServiceTicketsHeader />
      <Paper
        sx={{
          height: ({ mixins }) =>
            mixins.contentHeight(
              topbarHeight,
              (upSm ? mixins.footer.sm : mixins.footer.xs) + (upSm ? 117 : 161),
            ),
        }}
      >
        <SimpleBar>
          <Stack sx={{ height: 1, p: 3 }}>
            <ServiceTicketsList />
          </Stack>
        </SimpleBar>
      </Paper>
    </Paper>
  );
};

export default ServiceDeskTickets;
