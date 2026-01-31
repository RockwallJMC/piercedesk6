import { useEffect, useRef, useState } from 'react';
import { TabContext, TabList } from '@mui/lab';
import { Box, Paper, Stack, Tab, tabsClasses, tabScrollButtonClasses } from '@mui/material';
import { description, eventTermsConditions, performerList, schedule, equipmentList } from 'data/service-tickets';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { HashLinkBehavior } from 'theme/components/Link';
import { useScrollSpyContext } from 'components/scroll-spy';
import ScrollSpyNavItem from 'components/scroll-spy/ScrollSpyNavItem';
import EventDescription from 'components/sections/service/ticket-detail/main/EventDescription';
import EventPerformers from 'components/sections/service/ticket-detail/main/EventPerformers';
import EventSchedule from 'components/sections/service/ticket-detail/main/EventSchedule';
import EventEquipment from 'components/sections/service/ticket-detail/main/EventEquipment';
import EventTerms from 'components/sections/service/ticket-detail/main/EventTerms';

const eventTabs = [
  { label: 'Summary', id: 'summary' },
  { label: 'Instructions', id: 'instructions' },
  { label: 'Details', id: 'details' },
  { label: 'Equipment', id: 'equipment' },
  { label: 'Terms & Conditions', id: 'terms' },
];

const EventsTabPanel = () => {
  const { down } = useBreakpoints();
  const isDownSm = down('sm');

  const tabsRef = useRef(null);

  const { topbarHeight } = useNavContext();
  const { activeElemId } = useScrollSpyContext();
  const [activeTab, setActiveTab] = useState(activeElemId || 'summary');
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (activeElemId && activeTab !== activeElemId) {
      setActiveTab(activeElemId);
    }
  }, [activeElemId, activeTab]);

  return (
    <Paper sx={{ outline: 0 }}>
      <TabContext value={activeTab}>
        <Box
          ref={tabsRef}
          sx={{
            position: 'sticky',
            zIndex: 10,
            mb: 2,
            top: topbarHeight,
            bgcolor: 'background.default',
          }}
        >
          <ScrollSpyNavItem>
            <TabList
              variant={isDownSm ? 'scrollable' : 'standard'}
              scrollButtons
              allowScrollButtonsMobile
              onChange={handleTabChange}
              aria-label="service ticket information tabs"
              centered={isDownSm ? false : true}
              sx={{
                py: 2,
                [`& .${tabsClasses.list}`]: { gap: 0, justifyContent: 'flex-start' },
                [`& .${tabScrollButtonClasses.disabled}`]: { opacity: '0.3 !important' },
              }}
            >
              {eventTabs.map(({ label, id }) => (
                <Tab
                  LinkComponent={HashLinkBehavior}
                  href={`#${id}`}
                  key={id}
                  value={id}
                  label={label}
                />
              ))}
            </TabList>
          </ScrollSpyNavItem>
        </Box>
      </TabContext>

      <Stack direction="column" spacing={3} sx={{ mb: 7 }}>
        <EventDescription description={description} />
        <EventSchedule schedule={schedule} />
        <EventPerformers performerList={performerList} />
        <EventEquipment equipmentList={equipmentList} />
        <EventTerms eventTermsConditions={eventTermsConditions} />
      </Stack>
    </Paper>
  );
};

export default EventsTabPanel;
