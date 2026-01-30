// Warranty configuration
export const warrantyTypes = {
  manufacturer: { label: 'Manufacturer' },
  workmanship: { label: 'Workmanship' },
  extended: { label: 'Extended' },
};

export const warrantyStatuses = {
  active: { label: 'Active', color: '#4caf50' },
  expiring: { label: 'Expiring Soon', color: '#ff9800' },
  expired: { label: 'Expired', color: '#f44336' },
};

// Mock data
export const warranties = [
  {
    id: 'WR-001',
    type: 'manufacturer',
    equipmentId: 'EQ-001',
    provider: 'HVAC Corp',
    startDate: '2022-03-15',
    endDate: '2027-03-15',
    parts: true,
    labor: true,
  },
  {
    id: 'WR-002',
    type: 'extended',
    equipmentId: 'EQ-002',
    provider: 'Service Plus',
    startDate: '2023-01-20',
    endDate: '2026-01-20',
    parts: true,
    labor: false,
  },
];

// Utility functions
export function checkWarrantyStatus(endDate) {
  const today = new Date();
  const end = new Date(endDate);
  const diffDays = Math.floor((end - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 90) return 'expiring';
  return 'active';
}

export function getExpiringWarranties(threshold = 90) {
  return warranties.filter(w => {
    const days = Math.floor((new Date(w.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= threshold;
  });
}
