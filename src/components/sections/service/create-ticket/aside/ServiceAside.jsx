import { Button, Divider, Paper, Stack } from '@mui/material';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import SimpleBar from 'components/base/SimpleBar';
import ServicePricing from 'components/sections/service/create-ticket/aside/ServicePricing';
import TicketSettings from 'components/sections/service/create-ticket/aside/TicketSettings';

const ServiceAside = ({ handleClose }) => {
  const { topbarHeight } = useNavContext();

  return (
    <Paper
      background={1}
      sx={(theme) => ({
        position: 'sticky',
        top: { xs: 0, md: topbarHeight.md },
        width: { md: 336, lg: 404 },
        height: { xs: 1, md: theme.mixins.contentHeight(topbarHeight).md },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <SimpleBar sx={{ flex: 1, maxHeight: 1, overflowY: 'auto' }}>
        <Stack direction="column" divider={<Divider flexItem orientation="horizontal" />}>
          <ServicePricing handleClose={handleClose} />
          <TicketSettings />
        </Stack>
      </SimpleBar>

      <Stack
        sx={{
          p: { xs: 3, lg: 5 },
          gap: 1,
          flexWrap: 'wrap',
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.elevation1',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button type="button" variant="soft" color="neutral" onClick={handleClose}>
          Save as draft
        </Button>
        <Button
          form="createServiceTicketForm"
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            flexGrow: 1,
          }}
        >
          Create Ticket
        </Button>
      </Stack>
    </Paper>
  );
};

export default ServiceAside;
