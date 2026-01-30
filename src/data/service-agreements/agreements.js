import { users } from 'data/users';
import { companies } from 'data/crm/deals';

// Agreement types
export const agreementTypes = {
  recurring_maintenance: {
    label: 'Recurring Maintenance',
    icon: 'material-symbols:autorenew',
    description: 'Regular scheduled maintenance visits',
  },
  on_demand: {
    label: 'On-Demand',
    icon: 'material-symbols:support-agent',
    description: 'Pay-per-service with no monthly fees',
  },
  warranty: {
    label: 'Warranty',
    icon: 'material-symbols:verified-outline',
    description: 'Equipment warranty coverage',
  },
  hybrid: {
    label: 'Hybrid',
    icon: 'material-symbols:merge',
    description: 'Combination of maintenance and on-demand',
  },
};

// Agreement statuses
export const agreementStatuses = {
  active: { label: 'Active', color: '#4caf50', icon: 'material-symbols:check-circle' },
  suspended: { label: 'Suspended', color: '#ff9800', icon: 'material-symbols:pause-circle' },
  expired: { label: 'Expired', color: '#f44336', icon: 'material-symbols:cancel' },
  cancelled: { label: 'Cancelled', color: '#9e9e9e', icon: 'material-symbols:block' },
};

// Billing frequencies
export const billingFrequencies = {
  monthly: { label: 'Monthly', months: 1 },
  quarterly: { label: 'Quarterly', months: 3 },
  semi_annually: { label: 'Semi-Annually', months: 6 },
  annually: { label: 'Annually', months: 12 },
};

// Helper to calculate next billing date
export const calculateNextBillingDate = (startDate, frequency) => {
  const start = new Date(startDate);
  const months = billingFrequencies[frequency].months;
  const next = new Date(start);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
};

// Mock service agreements data
export const serviceAgreements = [
  {
    id: 'SA-2024-001',
    agreementNumber: 'SA-2024-001',
    name: 'Premium Support - TechCorp',
    account: companies[0],
    type: 'hybrid',
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    autoRenew: true,
    billingFrequency: 'monthly',
    monthlyFee: 2500.0,
    includedHoursPerPeriod: 20,
    overageRate: 150.0,
    accountManager: users[0],
    siteAddress: {
      street: '123 Business Park Dr',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
    description: 'Premium support package including 24/7 monitoring, regular maintenance, and priority response times.',
    terms: 'Standard service terms apply. Additional charges for after-hours emergency support.',
    currentPeriod: {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      hoursUsed: 15.5,
      hoursRemaining: 4.5,
      overageHours: 0,
    },
    coveredEquipmentCount: 12,
    activeSchedulesCount: 4,
    openTicketsCount: 2,
    totalValue: 30000.0,
    createdAt: '2023-12-15T10:00:00Z',
    createdBy: users[0],
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'SA-2024-002',
    agreementNumber: 'SA-2024-002',
    name: 'Basic Maintenance - Innovate Inc',
    account: companies[1],
    type: 'recurring_maintenance',
    status: 'active',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2025-01-31T23:59:59Z',
    autoRenew: true,
    billingFrequency: 'quarterly',
    monthlyFee: 1500.0,
    includedHoursPerPeriod: 30,
    overageRate: 125.0,
    accountManager: users[1],
    siteAddress: {
      street: '456 Commerce Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    description: 'Quarterly maintenance visits for HVAC systems and building management systems.',
    terms: 'Quarterly visits scheduled in advance. Emergency services billed separately.',
    currentPeriod: {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-03-31T23:59:59Z',
      hoursUsed: 22.0,
      hoursRemaining: 8.0,
      overageHours: 0,
    },
    coveredEquipmentCount: 8,
    activeSchedulesCount: 2,
    openTicketsCount: 1,
    totalValue: 18000.0,
    createdAt: '2024-01-10T09:00:00Z',
    createdBy: users[1],
    updatedAt: '2024-01-12T11:20:00Z',
  },
  {
    id: 'SA-2024-003',
    agreementNumber: 'SA-2024-003',
    name: 'Enterprise Support - GlobalTech',
    account: companies[2],
    type: 'hybrid',
    status: 'active',
    startDate: '2023-07-01T00:00:00Z',
    endDate: '2025-06-30T23:59:59Z',
    autoRenew: true,
    billingFrequency: 'monthly',
    monthlyFee: 5000.0,
    includedHoursPerPeriod: 40,
    overageRate: 175.0,
    accountManager: users[2],
    siteAddress: {
      street: '789 Tech Center Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
    },
    description: 'Comprehensive enterprise support with dedicated technician and unlimited emergency support.',
    terms: 'White-glove service with 1-hour response time guarantee.',
    currentPeriod: {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      hoursUsed: 42.5,
      hoursRemaining: 0,
      overageHours: 2.5,
    },
    coveredEquipmentCount: 25,
    activeSchedulesCount: 8,
    openTicketsCount: 3,
    totalValue: 120000.0,
    createdAt: '2023-06-01T08:00:00Z',
    createdBy: users[2],
    updatedAt: '2024-01-15T16:45:00Z',
  },
  {
    id: 'SA-2024-004',
    agreementNumber: 'SA-2024-004',
    name: 'On-Demand Service - StartupCo',
    account: companies[3],
    type: 'on_demand',
    status: 'active',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2025-01-14T23:59:59Z',
    autoRenew: false,
    billingFrequency: 'monthly',
    monthlyFee: 0,
    includedHoursPerPeriod: 0,
    overageRate: 175.0,
    accountManager: users[3],
    siteAddress: {
      street: '321 Innovation Way',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
    description: 'Pay-as-you-go service agreement with no monthly fees.',
    terms: 'All services billed at standard hourly rate. 2-hour minimum per visit.',
    currentPeriod: {
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-02-14T23:59:59Z',
      hoursUsed: 8.0,
      hoursRemaining: 0,
      overageHours: 8.0,
    },
    coveredEquipmentCount: 0,
    activeSchedulesCount: 0,
    openTicketsCount: 0,
    totalValue: 0,
    createdAt: '2024-01-10T15:00:00Z',
    createdBy: users[3],
    updatedAt: '2024-01-15T09:30:00Z',
  },
];

// Helper functions
export const getAgreementById = (id) => serviceAgreements.find((a) => a.id === id);

export const getActiveAgreements = () =>
  serviceAgreements.filter((a) => a.status === 'active');

export const getAgreementsByAccount = (accountId) =>
  serviceAgreements.filter((a) => a.account.id === accountId);

export const calculateOverageCharges = (agreement) => {
  return agreement.currentPeriod.overageHours * agreement.overageRate;
};
