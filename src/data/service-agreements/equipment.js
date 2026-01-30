import { serviceAgreements } from './agreements';
import { users } from 'data/users';

// Equipment categories
export const equipmentCategories = {
  hvac: { label: 'HVAC', icon: 'material-symbols:air' },
  electrical: { label: 'Electrical', icon: 'material-symbols:bolt' },
  plumbing: { label: 'Plumbing', icon: 'material-symbols:water-drop' },
  security: { label: 'Security', icon: 'material-symbols:security' },
  fire_safety: { label: 'Fire Safety', icon: 'material-symbols:local-fire-department' },
  bms: { label: 'Building Management System', icon: 'material-symbols:apartment' },
  elevator: { label: 'Elevator', icon: 'material-symbols:elevator' },
  generator: { label: 'Generator', icon: 'material-symbols:power' },
};

// Equipment status
export const equipmentStatuses = {
  operational: { label: 'Operational', color: '#4caf50' },
  needs_maintenance: { label: 'Needs Maintenance', color: '#ff9800' },
  under_repair: { label: 'Under Repair', color: '#f44336' },
  decommissioned: { label: 'Decommissioned', color: '#9e9e9e' },
};

// Mock covered equipment data
export const coveredEquipment = [
  {
    id: 'EQ-001',
    agreementId: 'SA-2024-001',
    category: 'hvac',
    manufacturer: 'Carrier',
    model: 'WeatherMaster 48TC',
    serialNumber: 'CAR-2023-0045678',
    installDate: '2022-03-15T00:00:00Z',
    warrantyStartDate: '2022-03-15T00:00:00Z',
    warrantyEndDate: '2027-03-15T00:00:00Z',
    location: 'Rooftop - Building A',
    status: 'operational',
    specifications: {
      capacity: '48 tons',
      refrigerant: 'R-410A',
      voltage: '460V 3-Phase',
    },
    lastMaintenanceDate: '2024-01-10T00:00:00Z',
    nextMaintenanceDate: '2024-04-10T00:00:00Z',
    serviceHistory: ['ST-001', 'ST-003'],
    notes: 'Primary cooling unit for main office area',
    addedBy: users[0],
    addedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'EQ-002',
    agreementId: 'SA-2024-001',
    category: 'bms',
    manufacturer: 'Johnson Controls',
    model: 'Metasys M4',
    serialNumber: 'JCI-M4-8890123',
    installDate: '2023-01-20T00:00:00Z',
    warrantyStartDate: '2023-01-20T00:00:00Z',
    warrantyEndDate: '2026-01-20T00:00:00Z',
    location: 'Server Room',
    status: 'operational',
    specifications: {
      controlPoints: '500',
      network: 'BACnet IP',
      powerSupply: '24V DC',
    },
    lastMaintenanceDate: '2024-01-05T00:00:00Z',
    nextMaintenanceDate: '2024-07-05T00:00:00Z',
    serviceHistory: [],
    notes: 'Centralized building automation controller',
    addedBy: users[0],
    addedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'EQ-003',
    agreementId: 'SA-2024-001',
    category: 'fire_safety',
    manufacturer: 'Honeywell',
    model: 'NOTIFIER NFS2-640',
    serialNumber: 'HON-NFS-5567890',
    installDate: '2021-06-10T00:00:00Z',
    warrantyStartDate: '2021-06-10T00:00:00Z',
    warrantyEndDate: '2024-06-10T00:00:00Z',
    location: 'Main Electrical Room',
    status: 'operational',
    specifications: {
      zones: '640',
      type: 'Addressable',
      backup: '24hr battery',
    },
    lastMaintenanceDate: '2023-12-15T00:00:00Z',
    nextMaintenanceDate: '2024-06-15T00:00:00Z',
    serviceHistory: [],
    notes: 'Main fire alarm control panel - Annual inspection required',
    addedBy: users[0],
    addedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'EQ-004',
    agreementId: 'SA-2024-002',
    category: 'hvac',
    manufacturer: 'Trane',
    model: 'Voyager III',
    serialNumber: 'TRA-V3-2234567',
    installDate: '2023-08-05T00:00:00Z',
    warrantyStartDate: '2023-08-05T00:00:00Z',
    warrantyEndDate: '2028-08-05T00:00:00Z',
    location: 'Rooftop - East Wing',
    status: 'operational',
    specifications: {
      capacity: '25 tons',
      refrigerant: 'R-410A',
      voltage: '460V 3-Phase',
    },
    lastMaintenanceDate: '2023-12-01T00:00:00Z',
    nextMaintenanceDate: '2024-03-01T00:00:00Z',
    serviceHistory: ['ST-002'],
    notes: 'New installation - under extended warranty',
    addedBy: users[1],
    addedAt: '2024-02-01T09:00:00Z',
  },
  {
    id: 'EQ-005',
    agreementId: 'SA-2024-003',
    category: 'generator',
    manufacturer: 'Caterpillar',
    model: 'C18 ACERT',
    serialNumber: 'CAT-C18-9876543',
    installDate: '2020-11-20T00:00:00Z',
    warrantyStartDate: '2020-11-20T00:00:00Z',
    warrantyEndDate: '2023-11-20T00:00:00Z',
    location: 'Generator Building',
    status: 'needs_maintenance',
    specifications: {
      power: '500 kW',
      fuel: 'Diesel',
      voltage: '480V 3-Phase',
    },
    lastMaintenanceDate: '2023-11-15T00:00:00Z',
    nextMaintenanceDate: '2024-02-15T00:00:00Z',
    serviceHistory: ['ST-004', 'ST-005'],
    notes: 'Warranty expired - requires oil change and filter replacement',
    addedBy: users[2],
    addedAt: '2023-07-01T08:00:00Z',
  },
  {
    id: 'EQ-006',
    agreementId: 'SA-2024-003',
    category: 'elevator',
    manufacturer: 'Otis',
    model: 'Gen2',
    serialNumber: 'OTS-G2-4455667',
    installDate: '2019-03-10T00:00:00Z',
    warrantyStartDate: '2019-03-10T00:00:00Z',
    warrantyEndDate: '2024-03-10T00:00:00Z',
    location: 'North Tower - Car 1',
    status: 'operational',
    specifications: {
      capacity: '3500 lbs',
      speed: '500 fpm',
      floors: '15',
    },
    lastMaintenanceDate: '2024-01-08T00:00:00Z',
    nextMaintenanceDate: '2024-02-08T00:00:00Z',
    serviceHistory: [],
    notes: 'Monthly inspection required by code',
    addedBy: users[2],
    addedAt: '2023-07-01T08:00:00Z',
  },
];

// Helper functions
export const getEquipmentByAgreement = (agreementId) =>
  coveredEquipment.filter((eq) => eq.agreementId === agreementId);

export const getEquipmentById = (id) => coveredEquipment.find((eq) => eq.id === id);

export const getEquipmentNeedingMaintenance = () =>
  coveredEquipment.filter((eq) => {
    const nextMaintenance = new Date(eq.nextMaintenanceDate);
    const today = new Date();
    return nextMaintenance <= today || eq.status === 'needs_maintenance';
  });
