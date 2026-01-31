'use client';

import { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import Tab from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import useSWR from 'swr';
import axiosInstance from 'services/axios/axiosInstance';
import { useCRMActivities } from 'services/swr/api-hooks/useCRMActivitiesApi';
import AllActivitiesTabPanel from './activity-tab-panels/all-activities';
import CallLogTabPanel from './activity-tab-panels/call-log';
import EmailTabPanel from './activity-tab-panels/email';
import MeetingTabPanel from './activity-tab-panels/meeting';
import NotesTabPanel from './activity-tab-panels/notes';
import TaskTabPanel from './activity-tab-panels/tasks';

const ActivityTab = {
  Activities: 'Activities',
  Email: 'Email',
  Meeting: 'Meeting',
  CallLog: 'Call log',
  Task: 'Task',
  Notes: 'Notes',
};

// Map tab to activity_type for API filtering
const tabToActivityType = {
  [ActivityTab.Activities]: null, // null = all activities
  [ActivityTab.Email]: 'email',
  [ActivityTab.Meeting]: 'meeting',
  [ActivityTab.CallLog]: 'call',
  [ActivityTab.Task]: 'task',
  [ActivityTab.Notes]: 'note',
};

const ActivityTabs = ({ contactId, entityType, entityId }) => {
  const [activeTab, setActiveTab] = useState(ActivityTab.Activities);

  // Fetch activities based on selected tab
  const activityType = tabToActivityType[activeTab];

  // Generic fetcher for activities that supports both contact and opportunity entities
  const activitiesFetcher = async (entityType, entityId, activityType) => {
    const params = new URLSearchParams({
      entity_type: entityType,
      entity_id: entityId,
    });

    if (activityType) {
      params.append('activity_type', activityType);
    }

    const response = await axiosInstance.get(`/api/crm/activities?${params.toString()}`);
    return response;
  };

  // Support both contactId (legacy) and entityType/entityId (new)
  const effectiveEntityType = entityType || 'contact';
  const effectiveEntityId = entityId || contactId;

  // Use legacy hook for contacts, generic fetcher for everything else
  const legacyHook = useCRMActivities(
    contactId && !entityType ? contactId : null,
    activityType
  );

  const genericHook = useSWR(
    entityType && entityId
      ? ['crm-activities', effectiveEntityType, effectiveEntityId, activityType]
      : null,
    () => activitiesFetcher(effectiveEntityType, effectiveEntityId, activityType),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  // Use whichever hook is active
  const { data: activities, isLoading } = entityType ? genericHook : legacyHook;

  const handleChange = (_event, newValue) => setActiveTab(newValue);

  // Transform API activities into grouped format expected by tab panels
  const transformActivitiesForPanel = (activities, type) => {
    if (!activities || activities.length === 0) return [];

    // Group activities by date
    const grouped = activities.reduce((acc, activity) => {
      const date = activity.activity_date.split('T')[0]; // Get date part only
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(activity);
      return acc;
    }, {});

    // Convert to array format expected by panels
    return Object.entries(grouped).map(([date, items]) => ({
      id: date,
      date: date,
      [type]: items,
    }));
  };

  // Prepare data for each tab panel type
  const allActivitiesData = transformActivitiesForPanel(
    activities,
    'activities'
  );

  const emailData = transformActivitiesForPanel(
    activeTab === ActivityTab.Email ? activities : [],
    'emails'
  );

  const meetingData = transformActivitiesForPanel(
    activeTab === ActivityTab.Meeting ? activities : [],
    'meetings'
  );

  const callLogData = transformActivitiesForPanel(
    activeTab === ActivityTab.CallLog ? activities : [],
    'calls'
  );

  const tasksData = activeTab === ActivityTab.Task ? activities || [] : [];
  const notesData = activeTab === ActivityTab.Notes ? activities || [] : [];

  return (
    <TabContext value={activeTab}>
      <Tabs
        onChange={handleChange}
        value={activeTab}
        variant="scrollable"
        scrollButtons={true}
        allowScrollButtonsMobile
        sx={{
          [`& .${tabsClasses.root}`]: {
            scrollMarginTop: '0 !important',
            WebkitTapHighlightColor: 'transparent',
          },
          [`& .${tabsClasses.scrollButtons}`]: {
            '&.Mui-disabled': { opacity: 0.3 },
          },
        }}
      >
        <Tab label={ActivityTab.Activities} value={ActivityTab.Activities} />
        <Tab label={ActivityTab.Email} value={ActivityTab.Email} />
        <Tab label={ActivityTab.Meeting} value={ActivityTab.Meeting} />
        <Tab label={ActivityTab.CallLog} value={ActivityTab.CallLog} />
        <Tab label={ActivityTab.Task} value={ActivityTab.Task} />
        <Tab label={ActivityTab.Notes} value={ActivityTab.Notes} />
      </Tabs>
      <TabPanel value={ActivityTab.Activities} sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <AllActivitiesTabPanel allActivities={allActivitiesData} />
        )}
      </TabPanel>
      <TabPanel value={ActivityTab.Email} sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <EmailTabPanel emailData={emailData} />
        )}
      </TabPanel>
      <TabPanel value={ActivityTab.Meeting} sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <MeetingTabPanel meetingData={meetingData} />
        )}
      </TabPanel>
      <TabPanel value={ActivityTab.CallLog} sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <CallLogTabPanel callLogData={callLogData} />
        )}
      </TabPanel>
      <TabPanel value={ActivityTab.Task} sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TaskTabPanel tasksData={tasksData} />
        )}
      </TabPanel>
      <TabPanel value={ActivityTab.Notes} sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <NotesTabPanel notes={notesData} />
        )}
      </TabPanel>
    </TabContext>
  );
};

export default ActivityTabs;
