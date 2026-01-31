import { useFormContext } from 'react-hook-form';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import ServiceActivitySection from 'components/sections/service/create-ticket/main/draggable-section/ServiceActivitySection';
import ServicePartsSection from 'components/sections/service/create-ticket/main/draggable-section/ServicePartsSection';
import ServicePhotoSection from 'components/sections/service/create-ticket/main/draggable-section/ServicePhotoSection';
import ServiceLaborSection from 'components/sections/service/create-ticket/main/draggable-section/ServiceLaborSection';
import ServiceNotesSection from 'components/sections/service/create-ticket/main/draggable-section/ServiceNotesSection';
import ServiceDeviceSection from 'components/sections/service/create-ticket/main/draggable-section/ServiceDeviceSection';
import StyledTextField from 'components/styled/StyledTextField';

const DraggableServiceSection = ({ section, index, handleChange, remove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const {
    register,
    formState: { errors },
  } = useFormContext();

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1 : 'unset',
  };

  return (
    <Paper
      ref={setNodeRef}
      background={1}
      style={style}
      sx={{
        p: 3,
        borderRadius: 6,
        outline: 0,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
    >
      <Stack direction="column" spacing={3}>
        <Stack justifyContent="space-between" alignItems="center" spacing={1}>
          <Button
            variant="text"
            color="neutral"
            shape="square"
            sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            {...listeners}
          >
            <IconifyIcon icon="material-symbols:drag-indicator" fontSize={20} />
          </Button>
          <Typography
            sx={{
              flexGrow: 1,
              fontSize: { xs: 'subtitle1.fontSize', lg: 'h6.fontSize' },
              lineClamp: 1,
              wordBreak: 'break-all',
            }}
            variant="h6"
          >
            {`Section ${index + 1}`}
          </Typography>

          <FormControl sx={{ maxWidth: { xs: 140, sm: 160 }, flexGrow: 1 }}>
            <StyledTextField
              select
              value={section.contentType}
              onChange={(e) => handleChange(index, e)}
            >
              <MenuItem value="activity">Activity</MenuItem>
              <MenuItem value="parts">Parts</MenuItem>
              <MenuItem value="photos">Photos</MenuItem>
              <MenuItem value="labor">Labor</MenuItem>
              <MenuItem value="notes">Notes</MenuItem>
              <MenuItem value="device">Device</MenuItem>
            </StyledTextField>
          </FormControl>
          <IconButton color="error" onClick={() => remove(index)}>
            <IconifyIcon icon="material-symbols:delete-outline-rounded" fontSize={20} />
          </IconButton>
        </Stack>

        <TextField
          fullWidth
          label="Title"
          variant="filled"
          {...register(`sections.${index}.title`)}
          error={!!errors.sections?.[index]?.title}
          helperText={errors.sections?.[index]?.title?.message}
        />
        {section.contentType === 'activity' && <ServiceActivitySection sectionIndex={index} />}
        {section.contentType === 'parts' && <ServicePartsSection sectionIndex={index} />}
        {section.contentType === 'photos' && <ServicePhotoSection sectionIndex={index} />}
        {section.contentType === 'labor' && <ServiceLaborSection sectionIndex={index} />}
        {section.contentType === 'notes' && <ServiceNotesSection sectionIndex={index} />}
        {section.contentType === 'device' && <ServiceDeviceSection sectionIndex={index} />}
      </Stack>
    </Paper>
  );
};

export default DraggableServiceSection;
