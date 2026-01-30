import { users } from 'data/users';
import { companies } from 'data/crm/deals';

// SLA Policy definitions
export const slaPolicies = {
  urgent: {
    priority: 'urgent',
    responseTimeHours: 1,
    resolutionTimeHours: 4,
    businessHoursOnly: false,
    color: '#f44336',
  },
  high: {
    priority: 'high',
    responseTimeHours: 4,
    resolutionTimeHours: 24,
    businessHoursOnly: true,
    color: '#ff9800',
  },
  medium: {
    priority: 'medium',
    responseTimeHours: 8,
    resolutionTimeHours: 72,
    businessHoursOnly: true,
    color: '#2196f3',
  },
  low: {
    priority: 'low',
    responseTimeHours: 24,
    resolutionTimeHours: 120,
    businessHoursOnly: true,
    color: '#4caf50',
  },
};

// Helper function to calculate SLA deadlines
export const calculateSLADeadlines = (createdAt, priority) => {
  const policy = slaPolicies[priority];
  const created = new Date(createdAt);
  
  const responseDeadline = new Date(created.getTime() + policy.responseTimeHours * 60 * 60 * 1000);
  const resolutionDeadline = new Date(created.getTime() + policy.resolutionTimeHours * 60 * 60 * 1000);
  
  return {
    responseDeadline,
    resolutionDeadline,
    policy,
  };
};

// Service ticket statuses
export const ticketStatuses = {
  open: { label: 'Open', color: '#2196f3' },
  assigned: { label: 'Assigned', color: '#ff9800' },
  in_progress: { label: 'In Progress', color: '#9c27b0' },
  on_hold: { label: 'On Hold', color: '#607d8b' },
  resolved: { label: 'Resolved', color: '#4caf50' },
  closed: { label: 'Closed', color: '#9e9e9e' },
};

// Ticket types
export const ticketTypes = {
  incident: { label: 'Incident', icon: 'material-symbols:warning-outline' },
  service_request: { label: 'Service Request', icon: 'material-symbols:build-outline' },
  maintenance: { label: 'Maintenance', icon: 'material-symbols:settings-outline' },
  warranty_claim: { label: 'Warranty Claim', icon: 'material-symbols:verified-outline' },
};

// Ticket sources
export const ticketSources = {
  phone: { label: 'Phone', icon: 'material-symbols:phone-outline' },
  email: { label: 'Email', icon: 'material-symbols:mail-outline' },
  portal: { label: 'Portal', icon: 'material-symbols:web-outline' },
  internal: { label: 'Internal', icon: 'material-symbols:business-outline' },
};

// Mock service tickets data
export const serviceTickets = [
  {
    id: 'ST-001',
    title: 'Network connectivity issues in Building A',
    description: 'Multiple users reporting intermittent network connectivity issues in Building A, floors 3-5. Issue started around 9:00 AM.',
    type: 'incident',
    priority: 'urgent',
    status: 'in_progress',
    source: 'phone',
    account: companies[0],
    serviceAgreement: 'SA-2024-001',
    assignedTo: users[2],
    createdBy: users[0],
    createdAt: '2024-01-15T09:15:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    firstResponseAt: '2024-01-15T09:45:00Z',
    resolvedAt: null,
    closedAt: null,
    siteAddress: {
      street: '123 Business Park Dr',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
    totalTimeLogged: 2.5,
    billableHours: 2.0,
    workNotes: [
      {
        id: 'note-1',
        content: 'Initial investigation shows switch failure on floor 3. Ordering replacement hardware.',
        author: users[2],
        createdAt: '2024-01-15T09:45:00Z',
        timeSpent: 0.5,
        billable: true,
        internal: false,
      },
      {
        id: 'note-2',
        content: 'Replacement switch installed. Testing connectivity.',
        author: users[2],
        createdAt: '2024-01-15T10:30:00Z',
        timeSpent: 2.0,
        billable: true,
        internal: false,
      },
    ],
  },
  {
    id: 'ST-002',
    title: 'Request for additional user licenses',
    description: 'Customer requesting 10 additional user licenses for their CRM system.',
    type: 'service_request',
    priority: 'medium',
    status: 'assigned',
    source: 'email',
    account: companies[1],
    serviceAgreement: 'SA-2024-002',
    assignedTo: users[3],
    createdBy: users[1],
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
    firstResponseAt: '2024-01-14T15:00:00Z',
    resolvedAt: null,
    closedAt: null,
    siteAddress: {
      street: '456 Commerce Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    totalTimeLogged: 0.5,
    billableHours: 0.5,
    workNotes: [
      {
        id: 'note-3',
        content: 'Confirmed license availability. Processing order with vendor.',
        author: users[3],
        createdAt: '2024-01-14T15:00:00Z',
        timeSpent: 0.5,
        billable: true,
        internal: false,
      },
    ],
  },
  {
    id: 'ST-003',
    title: 'Scheduled maintenance - Server updates',
    description: 'Monthly server maintenance and security updates for production environment.',
    type: 'maintenance',
    priority: 'low',
    status: 'open',
    source: 'internal',
    account: companies[2],
    serviceAgreement: 'SA-2024-003',
    assignedTo: null,
    createdBy: users[4],
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z',
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
    siteAddress: {
      street: '789 Tech Center Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
    },
    totalTimeLogged: 0,
    billableHours: 0,
    workNotes: [],
  },
  {
    id: 'ST-004',
    title: 'Hardware warranty claim - Printer malfunction',
    description: 'Office printer under warranty experiencing paper jam issues and print quality problems.',
    type: 'warranty_claim',
    priority: 'high',
    status: 'resolved',
    source: 'portal',
    account: companies[3],
    serviceAgreement: 'SA-2024-004',
    assignedTo: users[5],
    createdBy: users[2],
    createdAt: '2024-01-10T11:30:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    firstResponseAt: '2024-01-10T13:15:00Z',
    resolvedAt: '2024-01-12T16:45:00Z',
    closedAt: null,
    siteAddress: {
      street: '321 Innovation Way',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
    totalTimeLogged: 4.0,
    billableHours: 0, // Warranty work is not billable
    workNotes: [
      {
        id: 'note-4',
        content: 'Verified warranty status. Scheduling on-site visit.',
        author: users[5],
        createdAt: '2024-01-10T13:15:00Z',
        timeSpent: 0.5,
        billable: false,
        internal: false,
      },
      {
        id: 'note-5',
        content: 'Replaced printer drum and cleaned internal components. Issue resolved.',
        author: users[5],
        createdAt: '2024-01-12T16:45:00Z',
        timeSpent: 3.5,
        billable: false,
        internal: false,
      },
    ],
  },
  {
    id: 'ST-005',
    title: 'Email server performance degradation',
    description: 'Users reporting slow email performance and occasional timeouts when accessing mailboxes.',
    type: 'incident',
    priority: 'high',
    status: 'closed',
    source: 'email',
    account: companies[4],
    serviceAgreement: 'SA-2024-005',
    assignedTo: users[6],
    createdBy: users[3],
    createdAt: '2024-01-08T16:20:00Z',
    updatedAt: '2024-01-09T14:30:00Z',
    firstResponseAt: '2024-01-08T17:00:00Z',
    resolvedAt: '2024-01-09T14:00:00Z',
    closedAt: '2024-01-09T14:30:00Z',
    siteAddress: {
      street: '654 Enterprise Plaza',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
    },
    totalTimeLogged: 6.5,
    billableHours: 6.5,
    workNotes: [
      {
        id: 'note-6',
        content: 'Investigating email server performance metrics. High CPU usage detected.',
        author: users[6],
        createdAt: '2024-01-08T17:00:00Z',
        timeSpent: 1.0,
        billable: true,
        internal: false,
      },
      {
        id: 'note-7',
        content: 'Identified memory leak in email service. Applied patch and restarted service.',
        author: users[6],
        createdAt: '2024-01-09T10:15:00Z',
        timeSpent: 3.0,
        billable: true,
        internal: false,
      },
      {
        id: 'note-8',
        content: 'Monitoring performance for 4 hours. All metrics normal. Issue resolved.',
        author: users[6],
        createdAt: '2024-01-09T14:00:00Z',
        timeSpent: 2.5,
        billable: true,
        internal: false,
      },
    ],
  },
];

// Add SLA deadline calculations to each ticket
export const serviceTicketsWithSLA = serviceTickets.map(ticket => ({
  ...ticket,
  sla: calculateSLADeadlines(ticket.createdAt, ticket.priority),
}));
