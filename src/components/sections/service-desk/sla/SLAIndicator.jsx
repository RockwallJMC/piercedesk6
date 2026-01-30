'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

const SLAIndicator = ({ ticket, size = 'medium', 'data-testid': dataTestId, ...props }) => {
  const { sla, status, firstResponseAt, resolvedAt } = ticket;
  
  if (!sla) return null;

  const now = new Date();
  const { responseDeadline, resolutionDeadline, policy } = sla;
  
  // Determine SLA status
  const getSLAStatus = () => {
    // If ticket is closed, show final SLA status
    if (status === 'closed' || status === 'resolved') {
      const responseBreached = firstResponseAt ? new Date(firstResponseAt) > responseDeadline : true;
      const resolutionBreached = resolvedAt ? new Date(resolvedAt) > resolutionDeadline : false;
      
      if (responseBreached || resolutionBreached) {
        return {
          status: 'breached',
          color: '#f44336',
          icon: 'material-symbols:warning',
          label: 'SLA Breached',
        };
      }
      return {
        status: 'met',
        color: '#4caf50',
        icon: 'material-symbols:check-circle',
        label: 'SLA Met',
      };
    }

    // For active tickets, check current status
    const responseOverdue = !firstResponseAt && now > responseDeadline;
    const resolutionOverdue = now > resolutionDeadline;
    
    if (responseOverdue || resolutionOverdue) {
      return {
        status: 'breached',
        color: '#f44336',
        icon: 'material-symbols:warning',
        label: 'SLA Breached',
      };
    }
    
    // Check if approaching deadline (within 25% of time)
    const responseTimeRemaining = responseDeadline - now;
    const resolutionTimeRemaining = resolutionDeadline - now;
    const responseThreshold = policy.responseTimeHours * 60 * 60 * 1000 * 0.25;
    const resolutionThreshold = policy.resolutionTimeHours * 60 * 60 * 1000 * 0.25;
    
    if ((!firstResponseAt && responseTimeRemaining < responseThreshold) || 
        resolutionTimeRemaining < resolutionThreshold) {
      return {
        status: 'warning',
        color: '#ff9800',
        icon: 'material-symbols:schedule',
        label: 'SLA At Risk',
      };
    }
    
    return {
      status: 'on_track',
      color: '#4caf50',
      icon: 'material-symbols:check-circle',
      label: 'SLA On Track',
    };
  };

  const slaStatus = getSLAStatus();

  return (
    <Tooltip title={slaStatus.label}>
      <Chip
        data-testid={dataTestId}
        icon={<IconifyIcon icon={slaStatus.icon} />}
        label={size === 'small' ? '' : slaStatus.label}
        size={size}
        sx={{ bgcolor: slaStatus.color, color: 'white' }}
        {...props}
      />
    </Tooltip>
  );
};

export default SLAIndicator;
