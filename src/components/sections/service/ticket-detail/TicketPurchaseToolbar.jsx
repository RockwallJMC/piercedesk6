import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

const TicketPurchaseToolbar = ({ onPurchaseClick, ticketStatus = 'in_progress' }) => {
  const isCompleted = ticketStatus === 'completed';

  return (
    <Paper
      component={Stack}
      sx={({ mixins }) => ({
        position: 'sticky',
        zIndex: 999,
        width: 1,
        bottom: 0,
        bgcolor: 'background.menu',
        height: mixins.footer.sm,
      })}
    >
      <Container
        component={Stack}
        maxWidth={false}
        sx={{
          px: { xs: 3, md: 5 },
          py: 1,
          maxWidth: 1280,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6">$125 - $225</Typography>
        <Stack spacing={1}>
          <Button variant="soft" shape="square" color="neutral">
            <IconifyIcon icon="material-symbols:favorite-outline-rounded" width={20} height={20} />
          </Button>
          {isCompleted ? (
            <Button variant="contained" onClick={onPurchaseClick}>
              Request Payment
            </Button>
          ) : (
            <Button variant="outlined" disabled>
              Payment Unavailable
            </Button>
          )}
        </Stack>
      </Container>
      {!isCompleted && (
        <Container
          maxWidth={false}
          sx={{
            px: { xs: 3, md: 5 },
            pb: 2,
            maxWidth: 1280,
          }}
        >
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Payment available when ticket is marked complete
          </Alert>
        </Container>
      )}
    </Paper>
  );
};

export default TicketPurchaseToolbar;
