# Service Agreements Management - Phase 2.5

## Overview

The Service Agreements feature provides comprehensive management of ongoing service contracts, recurring maintenance schedules, warranty tracking, and covered equipment management for field service operations.

**Status**: ✅ Implemented  
**Timeline**: Weeks 9-10  
**Phase**: 2.5 - Core Operations  
**Dependencies**: Phase 2.4 (Ticket Management)

## Features Implemented

### 1. Service Agreements

**Location**: `/apps/service-agreements`

- ✅ Agreements list with DataGrid
- ✅ Agreement types (recurring_maintenance, on_demand, warranty, hybrid)
- ✅ Status tracking (active, suspended, expired, cancelled)
- ✅ Billing frequency configuration (monthly, quarterly, annually)
- ✅ Included hours per billing period
- ✅ Overage rate calculations
- ✅ Auto-renewal settings
- ✅ Site address tracking
- ✅ Filter by status

**Components**:
- `ServiceAgreementsList` - Main DataGrid view
- `CreateAgreementDialog` - New agreement creation form

### 2. Agreement Detail View

**Location**: `/apps/service-agreements/[id]`

- ✅ Comprehensive agreement header with KPIs
- ✅ Tabbed interface for different aspects
- ✅ Real-time hours usage tracking
- ✅ Overage calculation and display
- ✅ Quick stats sidebar

**Tabs**:
1. **Overview** - Agreement details, terms, and location
2. **Equipment** - Covered equipment management
3. **Schedules** - Maintenance schedule management
4. **Billing** - Billing history and current period details

### 3. Covered Equipment

**Features**:
- ✅ Equipment registration under agreements
- ✅ Device type and model tracking
- ✅ Serial number logging
- ✅ Location tracking
- ✅ Warranty expiration per item
- ✅ Equipment service history link
- ✅ Visual equipment cards with status
- ✅ Last/next maintenance dates

**Equipment Categories**:
- HVAC
- Electrical
- Plumbing
- Security
- Fire Safety
- Building Management Systems (BMS)
- Elevators
- Generators

### 4. Maintenance Scheduling

**Features**:
- ✅ Maintenance schedule creation
- ✅ Frequency settings (weekly, biweekly, monthly, quarterly, semi-annually, annually)
- ✅ Next due date calculations
- ✅ Assigned technician
- ✅ Estimated hours per maintenance
- ✅ Task checklists
- ✅ Overdue indicators
- ✅ Schedule activation/deactivation

**Automatic Ticket Generation** (Planned):
- Generate service tickets on schedule due date
- Ticket type: "maintenance"
- Auto-assign to designated technician
- Include estimated hours from schedule

### 5. Warranty Tracking

**Features**:
- ✅ Warranty registration
- ✅ Warranty types (manufacturer, workmanship, extended)
- ✅ Start and end date tracking
- ✅ Parts and labor coverage flags
- ✅ Warranty provider information
- ✅ Status calculation (active, expiring_soon, expired)

**Expiration Alerts** (Data layer ready):
- 30, 60, 90 days before expiration
- Helper functions for filtering expiring warranties

### 6. Billing Integration

**Features**:
- ✅ Included hours tracking vs. actual hours used
- ✅ Overage hour calculations
- ✅ Billing period summaries
- ✅ Current period display
- ✅ Billing history view
- ✅ Visual progress bars for hour usage

## Data Models

### Service Agreement
```javascript
{
  id, agreementNumber, name, account, type, status,
  startDate, endDate, autoRenew, billingFrequency,
  monthlyFee, includedHoursPerPeriod, overageRate,
  accountManager, siteAddress, description, terms,
  currentPeriod: { hoursUsed, hoursRemaining, overageHours },
  coveredEquipmentCount, activeSchedulesCount, openTicketsCount
}
```

### Covered Equipment
```javascript
{
  id, agreementId, category, manufacturer, model, serialNumber,
  installDate, warrantyStartDate, warrantyEndDate,
  location, status, specifications,
  lastMaintenanceDate, nextMaintenanceDate, serviceHistory
}
```

### Maintenance Schedule
```javascript
{
  id, agreementId, name, description, frequency, status,
  equipmentIds, assignedTechnician, estimatedHours,
  lastCompletedDate, nextDueDate, autoGenerateTicket,
  taskChecklist
}
```

### Warranty
```javascript
{
  id, type, equipmentId, provider, startDate, endDate,
  partsCovered, laborCovered
}
```

## API Endpoints (To Be Implemented)

- `GET /api/service-agreements` - List agreements
- `POST /api/service-agreements` - Create agreement
- `GET /api/service-agreements/:id` - Get agreement details
- `PATCH /api/service-agreements/:id` - Update agreement
- `DELETE /api/service-agreements/:id` - Delete agreement
- `GET /api/service-agreements/:id/equipment` - Get equipment
- `POST /api/service-agreements/:id/equipment` - Add equipment
- `GET /api/service-agreements/:id/schedules` - Get schedules
- `POST /api/service-agreements/:id/schedules` - Create schedule

## Testing

```bash
# Run service agreements tests
npx playwright test tests/service-agreements.spec.js

# Run all tests
npm test
```

## Future Enhancements

- Automatic ticket generation from schedules (cron job integration)
- Warranty expiration email notifications
- Equipment maintenance history timeline
- Advanced billing reports and analytics
- Contract renewal workflow
- Mobile-responsive equipment inspection forms
