import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ActivityTabs from '../../common/ActivityTabs';

const ActivityMonitoring = ({ dealId }) => {
  return (
    <Paper
      component={Stack}
      direction="column"
      sx={{ pt: { xs: 3, md: 5 }, px: { xs: 3, md: 5 }, pb: 12, height: 1 }}
    >
      <Typography variant="h5" sx={{ mb: 4 }}>
        Activity Monitoring
      </Typography>
      <ActivityTabs entityType="opportunity" entityId={dealId} />
    </Paper>
  );
};

export default ActivityMonitoring;
