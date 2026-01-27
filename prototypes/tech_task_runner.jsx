import React, { useState, useEffect, useRef } from 'react';
import {
  PlayArrow,
  Pause,
  Stop,
  Add,
  CameraAlt,
  Flag,
  CheckCircle,
  Schedule,
  Warning,
  MoreVert,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Commit,
  AccountTree,
  Timeline,
  PhotoCamera,
  NoteAdd,
  BugReport,
  CloudOff,
  Sync,
  Person,
  AccessTime,
  TrendingUp,
  Circle,
  RadioButtonUnchecked,
  FiberManualRecord,
  CallSplit,
  MergeType,
  ExpandMore,
  ChevronRight,
  Edit,
  Close,
  Check,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  TextField,
  LinearProgress,
  Fab,
  Drawer,
  SwipeableDrawer,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Divider,
  Paper,
  Slide,
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Card,
  CardContent,
  Tooltip,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
} from '@mui/material';
import { keyframes, styled } from '@mui/system';

// ═══════════════════════════════════════════════════════════════════════════
// THEME: Terminal Noir
// ═══════════════════════════════════════════════════════════════════════════

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0e14',
      paper: '#0d1219',
    },
    primary: { main: '#00ffcc' }, // Phosphor cyan
    secondary: { main: '#ffaa00' }, // Amber (running)
    error: { main: '#ff3366' }, // Crimson (issues)
    success: { main: '#88cc88' }, // Sage (completed)
    warning: { main: '#ffaa00' },
    text: {
      primary: '#e6edf3',
      secondary: '#7d8590',
      disabled: '#484f58',
    },
    divider: 'rgba(0, 255, 204, 0.08)',
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    h1: { fontFamily: '"Outfit", "Sora", sans-serif', fontWeight: 700 },
    h2: { fontFamily: '"Outfit", "Sora", sans-serif', fontWeight: 600 },
    h3: { fontFamily: '"Outfit", "Sora", sans-serif', fontWeight: 600 },
    h4: { fontFamily: '"Outfit", "Sora", sans-serif', fontWeight: 500 },
    h5: { fontFamily: '"Outfit", "Sora", sans-serif', fontWeight: 500 },
    h6: { fontFamily: '"Outfit", "Sora", sans-serif', fontWeight: 500 },
    button: { fontFamily: '"Outfit", sans-serif', fontWeight: 500, letterSpacing: '0.02em' },
    caption: { fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '0.7rem',
        },
      },
    },
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.92); }
`;

const breathe = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(255, 170, 0, 0.4); }
  50% { box-shadow: 0 0 20px rgba(255, 170, 0, 0.8); }
`;

const drawLine = keyframes`
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const tick = keyframes`
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(-100%); opacity: 0; }
  51% { transform: translateY(100%); }
  100% { transform: translateY(0); opacity: 1; }
`;

const scanLine = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

// ═══════════════════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const AppContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `
    linear-gradient(180deg, #0a0e14 0%, #0d1219 50%, #0a0e14 100%),
    repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(0, 255, 204, 0.02) 40px, rgba(0, 255, 204, 0.02) 41px),
    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0, 255, 204, 0.02) 40px, rgba(0, 255, 204, 0.02) 41px)
  `,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 204, 0.05) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 255, 204, 0.3), transparent)',
    animation: `${scanLine} 8s linear infinite`,
    opacity: 0.3,
    pointerEvents: 'none',
  },
}));

const ThreadLine = styled(Box)(({ color = '#00ffcc', delay = 0 }) => ({
  position: 'absolute',
  left: 28,
  top: 0,
  bottom: 0,
  width: 2,
  background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.3)} 100%)`,
  animation: `${fadeUp} 0.6s ease-out ${delay}ms both`,
}));

const StatusDot = styled(Box)(({ status, size = 12 }) => {
  const colors = {
    running: '#ffaa00',
    paused: '#ffaa00',
    pending: 'transparent',
    blocked: '#ff3366',
    completed: '#88cc88',
  };
  const isRunning = status === 'running';
  const isPending = status === 'pending';

  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: isPending ? 'transparent' : colors[status] || '#7d8590',
    border: isPending ? `2px solid #7d8590` : 'none',
    animation: isRunning ? `${pulse} 2s ease-in-out infinite` : 'none',
    boxShadow: isRunning ? `0 0 12px ${colors[status]}` : 'none',
    transition: 'all 0.3s ease',
  };
});

const TaskCard = styled(Paper)(({ theme, status, delay = 0 }) => {
  const borderColors = {
    running: 'rgba(255, 170, 0, 0.5)',
    paused: 'rgba(255, 170, 0, 0.3)',
    pending: 'rgba(125, 133, 144, 0.2)',
    blocked: 'rgba(255, 51, 102, 0.5)',
    completed: 'rgba(136, 204, 136, 0.3)',
  };

  return {
    background:
      status === 'running'
        ? 'linear-gradient(135deg, rgba(255, 170, 0, 0.08) 0%, rgba(13, 18, 25, 0.95) 100%)'
        : 'rgba(13, 18, 25, 0.85)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${borderColors[status] || 'rgba(125, 133, 144, 0.15)'}`,
    borderLeft: status === 'running' ? '3px solid #ffaa00' : `1px solid ${borderColors[status]}`,
    padding: theme.spacing(1.5, 2),
    marginLeft: theme.spacing(5),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    animation: `${slideIn} 0.4s ease-out ${delay}ms both`,
    '&:hover': {
      background: 'rgba(0, 255, 204, 0.05)',
      borderColor: 'rgba(0, 255, 204, 0.3)',
      transform: 'translateX(4px)',
    },
  };
});

const TimeDisplay = styled(Box)(({ running }) => ({
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: '2.5rem',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  color: running ? '#ffaa00' : '#e6edf3',
  textShadow: running ? '0 0 30px rgba(255, 170, 0, 0.5)' : 'none',
  transition: 'all 0.3s ease',
  '& .seconds': {
    fontSize: '1.8rem',
    opacity: 0.7,
  },
}));

const FloatingRunner = styled(Paper)(({ theme, expanded }) => ({
  position: 'fixed',
  bottom: expanded ? 0 : 80,
  left: expanded ? 0 : 16,
  right: expanded ? 0 : 16,
  background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15) 0%, rgba(13, 18, 25, 0.98) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 170, 0, 0.3)',
  borderRadius: expanded ? '16px 16px 0 0' : 12,
  padding: theme.spacing(1.5, 2),
  zIndex: 1200,
  animation: `${breathe} 3s ease-in-out infinite`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const CheckpointLine = styled(Box)(({ completed }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '8px 0',
  opacity: completed ? 0.6 : 1,
  '& .checkpoint-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: completed ? '#88cc88' : 'transparent',
    border: completed ? 'none' : '2px solid #7d8590',
  },
}));

const GraphNode = styled(Box)(({ status, size = 16 }) => {
  const colors = {
    running: '#ffaa00',
    paused: '#ffaa00',
    pending: '#7d8590',
    blocked: '#ff3366',
    completed: '#88cc88',
  };

  return {
    width: size,
    height: size,
    borderRadius: '50%',
    background: status === 'pending' ? 'transparent' : colors[status],
    border: `2px solid ${colors[status]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.3)',
      boxShadow: `0 0 12px ${colors[status]}`,
    },
  };
});

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const mockTasks = [
  {
    id: 't1',
    title: 'Camera Installation - Lobby',
    jobRef: 'JOB-2024-0891',
    project: 'Meridian Tower Security',
    status: 'running',
    hoursActual: 2.57,
    hoursPredicted: 4.0,
    assignees: ['JM', 'KR'],
    checkpoints: [
      { id: 'c1', title: 'Mount camera brackets', completed: true },
      { id: 'c2', title: 'Run CAT6 to head-end', completed: true },
      { id: 'c3', title: 'Configure IP settings', completed: false },
      { id: 'c4', title: 'Aim and focus', completed: false },
    ],
    notes: [{ id: 'n1', text: 'Drywall harder than expected, used toggle bolts', time: '09:23' }],
    issues: [],
    photos: ['/api/placeholder/80/80', '/api/placeholder/80/80'],
    startTime: Date.now() - 9240000,
    pmIntervention: null,
  },
  {
    id: 't2',
    title: 'Access Control - Suite 400',
    jobRef: 'JOB-2024-0891',
    project: 'Meridian Tower Security',
    status: 'paused',
    hoursActual: 1.25,
    hoursPredicted: 2.0,
    assignees: ['JM'],
    checkpoints: [
      { id: 'c1', title: 'Install reader', completed: true },
      { id: 'c2', title: 'Wire to panel', completed: false },
      { id: 'c3', title: 'Program credentials', completed: false },
    ],
    notes: [],
    issues: [
      {
        id: 'i1',
        severity: 'medium',
        category: 'access',
        text: 'Tenant not on-site for door testing',
      },
    ],
    photos: [],
    startTime: null,
    pmIntervention: { type: 'reassigned', by: 'Sarah M.', reason: 'Priority shift' },
  },
  {
    id: 't3',
    title: 'NVR Configuration',
    jobRef: 'JOB-2024-0891',
    project: 'Meridian Tower Security',
    status: 'pending',
    hoursActual: 0,
    hoursPredicted: 1.5,
    assignees: ['KR'],
    checkpoints: [
      { id: 'c1', title: 'Rack mount NVR', completed: false },
      { id: 'c2', title: 'Configure network', completed: false },
      { id: 'c3', title: 'Add all cameras', completed: false },
      { id: 'c4', title: 'Set retention policy', completed: false },
    ],
    notes: [],
    issues: [],
    photos: [],
    startTime: null,
    pmIntervention: null,
  },
  {
    id: 't4',
    title: 'Panel Terminations',
    jobRef: 'JOB-2024-0892',
    project: 'Riverside Office',
    status: 'completed',
    hoursActual: 3.75,
    hoursPredicted: 3.0,
    assignees: ['JM'],
    checkpoints: [
      { id: 'c1', title: 'Label all cables', completed: true },
      { id: 'c2', title: 'Terminate patch panel', completed: true },
      { id: 'c3', title: 'Test all runs', completed: true },
    ],
    notes: [{ id: 'n1', text: 'Added 4 extra runs per client request', time: '14:30' }],
    issues: [],
    photos: ['/api/placeholder/80/80'],
    startTime: null,
    pmIntervention: null,
  },
  {
    id: 't5',
    title: 'Intercom Repair',
    jobRef: 'TKT-2024-1204',
    project: 'Service Call',
    status: 'blocked',
    hoursActual: 0.5,
    hoursPredicted: 1.0,
    assignees: ['KR'],
    checkpoints: [
      { id: 'c1', title: 'Diagnose issue', completed: true },
      { id: 'c2', title: 'Replace faulty board', completed: false },
    ],
    notes: [
      { id: 'n1', text: 'Board is obsolete, need to order compatible replacement', time: '11:15' },
    ],
    issues: [
      {
        id: 'i1',
        severity: 'high',
        category: 'material',
        text: 'Part on backorder - 2 week lead time',
      },
    ],
    photos: [],
    startTime: null,
    pmIntervention: null,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
};

const HoursBar = ({ actual, predicted }) => {
  const percentage = Math.min((actual / predicted) * 100, 150);
  const isOver = actual > predicted;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {actual.toFixed(1)}h / {predicted.toFixed(1)}h
        </Typography>
        {isOver && (
          <Typography variant="caption" sx={{ color: 'error.main' }}>
            +{(actual - predicted).toFixed(1)}h over
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: 4,
          bgcolor: 'rgba(125, 133, 144, 0.2)',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.min(percentage, 100)}%`,
            bgcolor: isOver ? 'error.main' : 'primary.main',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }}
        />
        {percentage > 100 && (
          <Box
            sx={{
              position: 'absolute',
              left: '100%',
              top: -2,
              height: 8,
              width: 2,
              bgcolor: 'text.secondary',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

const OfflineBadge = () => (
  <Chip
    icon={<CloudOff sx={{ fontSize: 14 }} />}
    label="Offline"
    size="small"
    sx={{
      bgcolor: 'rgba(255, 170, 0, 0.15)',
      color: 'warning.main',
      border: '1px solid rgba(255, 170, 0, 0.3)',
      '& .MuiChip-icon': { color: 'warning.main' },
    }}
  />
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const CommandDeck = ({ tasks, onTaskSelect, activeTask }) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const totalActual = tasks.reduce((sum, t) => sum + t.hoursActual, 0);
  const totalPredicted = tasks.reduce((sum, t) => sum + t.hoursPredicted, 0);
  const runningCount = tasks.filter((t) => t.status === 'running').length;

  const groupedByJob = tasks.reduce((acc, task) => {
    if (!acc[task.jobRef]) acc[task.jobRef] = [];
    acc[task.jobRef].push(task);
    return acc;
  }, {});

  return (
    <Box sx={{ pb: activeTask ? 16 : 10 }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          animation: `${fadeUp} 0.5s ease-out`,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {today}
          </Typography>
          <Typography variant="h5" sx={{ color: 'text.primary', mt: 0.5 }}>
            Task Runner
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OfflineBadge />
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            <Sync sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Bar */}
      <Box
        sx={{
          mx: 2,
          p: 1.5,
          bgcolor: 'rgba(0, 255, 204, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(0, 255, 204, 0.1)',
          display: 'flex',
          justifyContent: 'space-around',
          animation: `${fadeUp} 0.5s ease-out 100ms both`,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Logged
          </Typography>
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            {totalActual.toFixed(1)}h
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Target
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            {totalPredicted.toFixed(1)}h
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Active
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: runningCount > 0 ? 'warning.main' : 'text.primary' }}
          >
            {runningCount}
          </Typography>
        </Box>
      </Box>

      {/* Thread Timeline */}
      <Box sx={{ mt: 3, position: 'relative' }}>
        {Object.entries(groupedByJob).map(([jobRef, jobTasks], jobIndex) => (
          <Box key={jobRef} sx={{ position: 'relative', mb: 3 }}>
            {/* Job Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 2,
                mb: 1,
                animation: `${slideIn} 0.4s ease-out ${jobIndex * 150}ms both`,
              }}
            >
              <CallSplit
                sx={{ fontSize: 16, color: 'primary.main', mr: 1, transform: 'rotate(180deg)' }}
              />
              <Typography variant="caption" sx={{ color: 'primary.main' }}>
                {jobRef}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                · {jobTasks[0].project}
              </Typography>
            </Box>

            {/* Thread Line */}
            <ThreadLine color="#00ffcc" delay={jobIndex * 150 + 200} />

            {/* Tasks */}
            {jobTasks.map((task, taskIndex) => (
              <Box key={task.id} sx={{ position: 'relative' }}>
                {/* Status Dot on Thread */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 23,
                    top: 20,
                    zIndex: 2,
                    animation: `${fadeUp} 0.4s ease-out ${jobIndex * 150 + taskIndex * 100 + 300}ms both`,
                  }}
                >
                  <StatusDot status={task.status} />
                </Box>

                {/* Branch Line for multi-assignee */}
                {task.assignees.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 29,
                      top: 26,
                      width: 12,
                      height: 2,
                      bgcolor: 'rgba(0, 255, 204, 0.3)',
                    }}
                  />
                )}

                <TaskCard
                  status={task.status}
                  delay={jobIndex * 150 + taskIndex * 100 + 300}
                  onClick={() => onTaskSelect(task)}
                  elevation={0}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <AvatarGroup
                          max={3}
                          sx={{
                            '& .MuiAvatar-root': {
                              width: 20,
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: 'rgba(0, 255, 204, 0.2)',
                              color: 'primary.main',
                              border: '1px solid rgba(0, 255, 204, 0.3)',
                            },
                          }}
                        >
                          {task.assignees.map((a) => (
                            <Avatar key={a}>{a}</Avatar>
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {task.checkpoints.filter((c) => c.completed).length}/
                          {task.checkpoints.length} checkpoints
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      {task.status === 'running' && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'warning.main',
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {formatTime(Math.floor((Date.now() - task.startTime) / 1000)).h}:
                          {formatTime(Math.floor((Date.now() - task.startTime) / 1000)).m}
                        </Typography>
                      )}
                      {task.status !== 'running' && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {task.hoursActual.toFixed(1)}h
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Chips Row */}
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {task.issues.length > 0 && (
                      <Chip
                        icon={<Flag sx={{ fontSize: 12 }} />}
                        label={`${task.issues.length} issue`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 51, 102, 0.15)',
                          color: 'error.main',
                          borderColor: 'rgba(255, 51, 102, 0.3)',
                          height: 20,
                        }}
                        variant="outlined"
                      />
                    )}
                    {task.pmIntervention && (
                      <Chip
                        label={`PM: ${task.pmIntervention.type}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0, 255, 204, 0.1)',
                          color: 'primary.main',
                          height: 20,
                        }}
                      />
                    )}
                    {task.photos.length > 0 && (
                      <Chip
                        icon={<PhotoCamera sx={{ fontSize: 12 }} />}
                        label={task.photos.length}
                        size="small"
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>

                  <HoursBar actual={task.hoursActual} predicted={task.hoursPredicted} />
                </TaskCard>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const TaskConsole = ({ task, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    task.startTime ? Math.floor((Date.now() - task.startTime) / 1000) : task.hoursActual * 3600,
  );
  const [isRunning, setIsRunning] = useState(task.status === 'running');
  const [noteText, setNoteText] = useState('');
  const [issueText, setIssueText] = useState('');
  const [issueSeverity, setIssueSeverity] = useState('medium');

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const time = formatTime(elapsedSeconds);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        animation: `${fadeUp} 0.3s ease-out`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'primary.main' }}>
            {task.jobRef}
          </Typography>
          <Typography variant="subtitle2">{task.title}</Typography>
        </Box>
        <IconButton sx={{ color: 'text.secondary' }}>
          <MoreVert />
        </IconButton>
      </Box>

      {/* Time Display */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: isRunning
            ? 'linear-gradient(180deg, rgba(255, 170, 0, 0.1) 0%, transparent 100%)'
            : 'transparent',
        }}
      >
        <TimeDisplay running={isRunning}>
          {time.h}:{time.m}
          <span className="seconds">:{time.s}</span>
        </TimeDisplay>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
          {!isRunning ? (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => setIsRunning(true)}
              sx={{
                bgcolor: 'warning.main',
                color: '#0a0e14',
                px: 4,
                '&:hover': { bgcolor: 'warning.light' },
              }}
            >
              Start
            </Button>
          ) : (
            <>
              <IconButton
                onClick={() => setIsRunning(false)}
                sx={{
                  bgcolor: 'rgba(255, 170, 0, 0.2)',
                  color: 'warning.main',
                  '&:hover': { bgcolor: 'rgba(255, 170, 0, 0.3)' },
                }}
              >
                <Pause />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<Stop />}
                sx={{ borderColor: 'error.main', color: 'error.main' }}
              >
                Stop
              </Button>
            </>
          )}
        </Box>

        <HoursBar actual={elapsedSeconds / 3600} predicted={task.hoursPredicted} />
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': {
            minWidth: 'auto',
            flex: 1,
            fontFamily: '"Outfit", sans-serif',
          },
        }}
      >
        <Tab label="Checkpoints" />
        <Tab label="Updates" />
        <Tab label="Issues" />
        <Tab label="Photos" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {/* Checkpoints Tab */}
        {activeTab === 0 && (
          <Box>
            {task.checkpoints.map((cp, i) => (
              <CheckpointLine key={cp.id} completed={cp.completed}>
                <Box className="checkpoint-dot" />
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    textDecoration: cp.completed ? 'line-through' : 'none',
                    color: cp.completed ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {cp.title}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ color: cp.completed ? 'success.main' : 'text.secondary' }}
                >
                  {cp.completed ? (
                    <CheckCircle sx={{ fontSize: 18 }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </CheckpointLine>
            ))}
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block' }}>
              All checkpoints must be completed before task can be closed.
            </Typography>
          </Box>
        )}

        {/* Updates Tab */}
        {activeTab === 1 && (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Add a note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(0, 255, 204, 0.03)',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'primary.main' },
                },
              }}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" startIcon={<NoteAdd />} variant="outlined">
                Add Note
              </Button>
              <Button
                size="small"
                startIcon={<Commit />}
                variant="outlined"
                sx={{ color: 'primary.main' }}
              >
                Checkpoint
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
              Activity Log
            </Typography>
            {task.notes.map((note) => (
              <Box
                key={note.id}
                sx={{
                  p: 1.5,
                  bgcolor: 'rgba(125, 133, 144, 0.1)',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'primary.main' }}>
                    Note
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {note.time}
                  </Typography>
                </Box>
                <Typography variant="body2">{note.text}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Issues Tab */}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {['low', 'medium', 'high'].map((sev) => (
                <Chip
                  key={sev}
                  label={sev}
                  onClick={() => setIssueSeverity(sev)}
                  sx={{
                    bgcolor:
                      issueSeverity === sev
                        ? sev === 'high'
                          ? 'error.main'
                          : sev === 'medium'
                            ? 'warning.main'
                            : 'success.main'
                        : 'transparent',
                    color: issueSeverity === sev ? '#0a0e14' : 'text.secondary',
                    border: '1px solid',
                    borderColor:
                      sev === 'high'
                        ? 'error.main'
                        : sev === 'medium'
                          ? 'warning.main'
                          : 'success.main',
                  }}
                />
              ))}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Describe the issue..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255, 51, 102, 0.05)',
                  '& fieldset': { borderColor: 'rgba(255, 51, 102, 0.3)' },
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={<Flag />}
              sx={{ mt: 1, bgcolor: 'error.main' }}
            >
              Flag Issue
            </Button>

            <Divider sx={{ my: 2 }} />

            {task.issues.map((issue) => (
              <Box
                key={issue.id}
                sx={{
                  p: 1.5,
                  bgcolor: 'rgba(255, 51, 102, 0.1)',
                  border: '1px solid rgba(255, 51, 102, 0.3)',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip
                    label={issue.severity}
                    size="small"
                    sx={{
                      bgcolor: issue.severity === 'high' ? 'error.main' : 'warning.main',
                      color: '#0a0e14',
                      height: 18,
                    }}
                  />
                  <Chip
                    label={issue.category}
                    size="small"
                    variant="outlined"
                    sx={{ height: 18 }}
                  />
                </Box>
                <Typography variant="body2">{issue.text}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Photos Tab */}
        {activeTab === 3 && (
          <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                mb: 2,
              }}
            >
              {task.photos.map((photo, i) => (
                <Box
                  key={i}
                  sx={{
                    aspectRatio: '1',
                    bgcolor: 'rgba(125, 133, 144, 0.2)',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhotoCamera sx={{ color: 'text.secondary' }} />
                </Box>
              ))}
              <Box
                sx={{
                  aspectRatio: '1',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Add sx={{ color: 'text.secondary' }} />
              </Box>
            </Box>
            <Button fullWidth variant="outlined" startIcon={<CameraAlt />}>
              Take Photo
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ThreadGraph = ({ tasks }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const projects = [...new Set(tasks.map((t) => t.project))];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Thread Graph
      </Typography>

      {/* Timeline Header */}
      <Box sx={{ display: 'flex', mb: 2, pl: 12 }}>
        {days.map((day) => (
          <Box key={day} sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Project Rows */}
      {projects.map((project, pi) => (
        <Box key={project} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              width: 100,
              color: 'primary.main',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project}
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 40,
              position: 'relative',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Thread Line */}
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '50%',
                height: 2,
                bgcolor: 'rgba(0, 255, 204, 0.2)',
              }}
            />

            {/* Task Nodes */}
            {tasks
              .filter((t) => t.project === project)
              .map((task, ti) => (
                <Tooltip key={task.id} title={task.title}>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${(ti + 1) * 20}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <GraphNode status={task.status} />
                  </Box>
                </Tooltip>
              ))}
          </Box>
        </Box>
      ))}

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['running', 'paused', 'pending', 'blocked', 'completed'].map((status) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StatusDot status={status} size={8} />
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'capitalize' }}
            >
              {status}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PierceTaskRunner() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState('deck'); // 'deck', 'graph'
  const [runnerExpanded, setRunnerExpanded] = useState(false);

  const activeTask = tasks.find((t) => t.status === 'running');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <AppContainer>
        {selectedTask ? (
          <TaskConsole
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updates) => {
              setTasks(tasks.map((t) => (t.id === selectedTask.id ? { ...t, ...updates } : t)));
            }}
          />
        ) : (
          <>
            {view === 'deck' && (
              <CommandDeck tasks={tasks} onTaskSelect={setSelectedTask} activeTask={activeTask} />
            )}
            {view === 'graph' && <ThreadGraph tasks={tasks} />}

            {/* Bottom Navigation */}
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(10, 14, 20, 0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-around',
                py: 1,
                zIndex: activeTask ? 1100 : 1300,
              }}
            >
              <IconButton
                onClick={() => setView('deck')}
                sx={{ color: view === 'deck' ? 'primary.main' : 'text.secondary' }}
              >
                <Timeline />
              </IconButton>
              <Fab
                size="medium"
                sx={{
                  bgcolor: 'primary.main',
                  color: '#0a0e14',
                  mt: -2,
                  '&:hover': { bgcolor: 'primary.light' },
                }}
              >
                <Add />
              </Fab>
              <IconButton
                onClick={() => setView('graph')}
                sx={{ color: view === 'graph' ? 'primary.main' : 'text.secondary' }}
              >
                <AccountTree />
              </IconButton>
            </Box>

            {/* Floating Runner */}
            {activeTask && (
              <FloatingRunner expanded={runnerExpanded}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                  onClick={() => setSelectedTask(activeTask)}
                >
                  <StatusDot status="running" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {activeTask.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'warning.main', fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {formatTime(Math.floor((Date.now() - activeTask.startTime) / 1000)).h}:
                      {formatTime(Math.floor((Date.now() - activeTask.startTime) / 1000)).m}:
                      {formatTime(Math.floor((Date.now() - activeTask.startTime) / 1000)).s}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: 'warning.main' }}>
                    <Pause />
                  </IconButton>
                </Box>
              </FloatingRunner>
            )}
          </>
        )}
      </AppContainer>
    </ThemeProvider>
  );
}
