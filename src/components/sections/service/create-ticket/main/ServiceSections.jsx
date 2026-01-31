import { useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { closestCenter } from '@dnd-kit/core';
import { Button, Stack } from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import SortableDnd from 'components/base/SortableDnd';
import ServiceFileDropzone from './ServiceFileDropzone';
import ServiceOverview from './ServiceOverview';
import DraggableServiceSection from './draggable-section';

const initializeSectionFields = (type, title) => ({
  title,
  contentType: type,
  images: [],
  ...(type === 'activity' && {
    activityName: '',
    activityType: '',
    activityDescription: '',
    durationEstimate: 0,
  }),
  ...(type === 'parts' && {
    parts: [
      {
        name: '',
        manufacturer: '',
        partNumber: '',
        quantity: 1,
        unitCost: 0,
        userGuideUrl: '',
        partId: 'part1',
      },
    ],
  }),
  ...(type === 'photos' && {
    photos: [
      {
        caption: '',
        type: 'Documentation',
        timestamp: new Date().toISOString(),
        photoId: 'photo1',
      },
    ],
  }),
  ...(type === 'labor' && {
    arrivalTime: null,
    departureTime: null,
    leadTech: '',
    helperTechs: [],
    hourlyRate: 0,
  }),
  ...(type === 'notes' && {
    instructionType: 'Customer Notes',
    notesContent: '',
    isPriority: false,
  }),
  ...(type === 'device' && {
    deviceName: '',
    makeModel: '',
    serialNumber: '',
    deviceLocation: '',
    deviceWorkPerformed: '',
  }),
});

const ServiceSections = () => {
  const { control } = useFormContext();

  const {
    fields: sections,
    append,
    update,
    remove,
    move,
  } = useFieldArray({
    control,
    name: 'sections',
  });

  const addSection = () =>
    append(initializeSectionFields('activity', `Section ${sections.length + 1}`));

  const handleChange = (index, event) => {
    const updatedContentType = event.target.value;
    update(index, initializeSectionFields(updatedContentType, sections[index].title));
  };

  const handleDragEnd = useCallback(
    (oldIndex, newIndex) => {
      move(oldIndex, newIndex);
    },
    [sections, move],
  );

  return (
    <div>
      <Stack direction="column" sx={{ rowGap: 4, mb: 4 }}>
        <ServiceFileDropzone />
        <ServiceOverview />
        <SortableDnd
          items={sections}
          handleDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          {sections.map((section, index) => (
            <DraggableServiceSection
              key={section.id}
              section={section}
              index={index}
              handleChange={handleChange}
              remove={remove}
            />
          ))}
        </SortableDnd>
      </Stack>

      <Button
        onClick={addSection}
        fullWidth
        color="neutral"
        variant="soft"
        startIcon={<IconifyIcon icon="material-symbols:add-rounded" />}
      >
        Add another section
      </Button>
    </div>
  );
};

export default ServiceSections;
