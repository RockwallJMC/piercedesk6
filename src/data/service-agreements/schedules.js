import { serviceAgreements } from './agreements';
import { coveredEquipment } from './equipment';
import { users } from 'data/users';

// Schedule frequencies
export const scheduleFrequencies = {
  weekly: { label: 'Weekly', days: 7 },
  biweekly: { label: 'Bi-Weekly', days: 14 },
  monthly: { label: 'Monthly', days: 30 },
  quarterly: { label: 'Quarterly', days: 90 },
  semi_annually: { label: 'Semi-Annually', days: 180 },
  annually: { label: 'Annually', days: 365 },
};

// Schedule statuses
export const scheduleStatuses = {
  active: { label: 'Active', color: '#4caf50' },
  paused: { label: 'Paused', color: '#ff9800' },
  inactive: { label: 'Inactive', color: '#9e9e9e' },
};

// Helper to calculate next due date
export const calculateNextDueDate = (lastCompletedDate, frequency) => {
  const last = new Date(lastCompletedDate);
  const days = scheduleFrequencies[frequency].days;
  const next = new Date(last);
  next.setDate(next.getDate() + days);
  return next.toISOString();
};

// Mock maintenance schedules data
export const maintenanceSchedules = [
  {
    id: 'MS-001',
    agreementId: 'SA-2024-001',
    name: 'HVAC Quarterly Inspection',
    description: 'Comprehensive HVAC system inspection including filter replacement, coil cleaning, and refrigerant check.',
    frequency: 'quarterly',
    status: 'active',
    equipmentIds: ['EQ-001'],
    assignedTechnician: users[2],
    estimatedHours: 4.0,
    lastCompletedDate: '2023-10-15T00:00:00Z',
    nextDueDate: '2024-01-15T00:00:00Z',
    lastGeneratedTicketId: 'ST-003',
    autoGenerateTicket: true,
    taskChecklist: [
      'Inspect and clean air filters',
      'Check refrigerant levels',
      'Clean condenser coils',
      'Inspect electrical connections',
      'Test thermostat operation',
      'Document findings and recommendations',
    ],
    createdBy: users[0],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: 'MS-002',
    agreementId: 'SA-2024-001',
    name: 'BMS System Health Check',
    description: 'Monthly building management system health check and software updates.',
    frequency: 'monthly',
    status: 'active',
    equipmentIds: ['EQ-002'],
    assignedTechnician: users[2],
    estimatedHours: 2.0,
    lastCompletedDate: '2023-12-05T00:00:00Z',
    nextDueDate: '2024-01-05T00:00:00Z',
    lastGeneratedTicketId: null,
    autoGenerateTicket: true,
    taskChecklist: [
      'Review system logs for errors',
      'Check all sensor readings',
      'Verify network connectivity',
      'Install pending software updates',
      'Test alarm notifications',
    ],
    createdBy: users[0],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-05T09:15:00Z',
  },
  {
    id: 'MS-003',
    agreementId: 'SA-2024-001',
    name: 'Fire Alarm Annual Inspection',
    description: 'Required annual fire alarm system inspection and testing per local fire code.',
    frequency: 'annually',
    status: 'active',
    equipmentIds: ['EQ-003'],
    assignedTechnician: users[5],
    estimatedHours: 6.0,
    lastCompletedDate: '2023-06-15T00:00:00Z',
    nextDueDate: '2024-06-15T00:00:00Z',
    lastGeneratedTicketId: null,
    autoGenerateTicket: true,
    taskChecklist: [
      'Test all smoke detectors',
      'Test all pull stations',
      'Verify horn/strobe operation',
      'Test control panel functions',
      'Check battery backup system',
      'Generate compliance report',
    ],
    createdBy: users[0],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'MS-004',
    agreementId: 'SA-2024-002',
    name: 'HVAC Filter Replacement',
    description: 'Bi-monthly air filter replacement for all HVAC units.',
    frequency: 'biweekly',
    status: 'active',
    equipmentIds: ['EQ-004'],
    assignedTechnician: users[3],
    estimatedHours: 1.5,
    lastCompletedDate: '2024-01-01T00:00:00Z',
    nextDueDate: '2024-01-15T00:00:00Z',
    lastGeneratedTicketId: 'ST-002',
    autoGenerateTicket: true,
    taskChecklist: [
      'Replace all air filters',
      'Inspect filter housings',
      'Document filter sizes used',
    ],
    createdBy: users[1],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-01-01T08:30:00Z',
  },
  {
    id: 'MS-005',
    agreementId: 'SA-2024-003',
    name: 'Generator Load Bank Testing',
    description: 'Quarterly load bank testing and fuel system maintenance for backup generator.',
    frequency: 'quarterly',
    status: 'active',
    equipmentIds: ['EQ-005'],
    assignedTechnician: users[2],
    estimatedHours: 3.0,
    lastCompletedDate: '2023-11-15T00:00:00Z',
    nextDueDate: '2024-02-15T00:00:00Z',
    lastGeneratedTicketId: 'ST-005',
    autoGenerateTicket: true,
    taskChecklist: [
      'Perform load bank test at 75% capacity',
      'Check oil level and quality',
      'Inspect fuel system for leaks',
      'Test automatic transfer switch',
      'Replace fuel filters',
      'Document runtime hours',
    ],
    createdBy: users[2],
    createdAt: '2023-07-01T08:00:00Z',
    updatedAt: '2023-11-15T16:45:00Z',
  },
];

// Helper functions
export const getSchedulesByAgreement = (agreementId) =>
  maintenanceSchedules.filter((s) => s.agreementId === agreementId);

export const getOverdueSchedules = () =>
  maintenanceSchedules.filter((s) => {
    const dueDate = new Date(s.nextDueDate);
    return s.status === 'active' && dueDate <= new Date();
  });
