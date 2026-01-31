import { Fragment } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import EventFileDropHandler from 'components/sections/service/create-ticket/EventFileDropHandler';

const photoTypes = ['Before', 'After', 'Problem', 'Solution', 'Documentation'];

const ServicePhotoSection = ({ sectionIndex }) => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.photos`,
  });

  const addPhoto = () => {
    append({
      caption: '',
      type: 'Documentation',
      timestamp: new Date().toISOString(),
      photoId: `photo${fields.length + 1}`,
    });
  };

  return (
    <Paper
      background={1}
      sx={{
        borderRadius: 6,
        outline: 'none',
      }}
    >
      <Grid container spacing={3}>
        <Grid size={12}>
          <Box sx={{ mb: 3 }}>
            {fields.map((field, index) => (
              <Fragment key={field.id}>
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Photo {index + 1}</Typography>
                    <IconButton color="error" onClick={() => remove(index)} size="small">
                      <IconifyIcon icon="material-symbols:delete-outline-rounded" fontSize={20} />
                    </IconButton>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <EventFileDropHandler
                        imagesField={`sections.${sectionIndex}.photos.${index}.image`}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        fullWidth
                        label="Caption"
                        variant="filled"
                        error={!!errors?.sections?.[sectionIndex]?.photos?.[index]?.caption}
                        helperText={errors?.sections?.[sectionIndex]?.photos?.[index]?.caption?.message}
                        {...register(`sections.${sectionIndex}.photos.${index}.caption`)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        select
                        label="Photo Type"
                        variant="filled"
                        defaultValue="Documentation"
                        error={!!errors?.sections?.[sectionIndex]?.photos?.[index]?.type}
                        helperText={errors?.sections?.[sectionIndex]?.photos?.[index]?.type?.message}
                        {...register(`sections.${sectionIndex}.photos.${index}.type`)}
                      >
                        {photoTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
              </Fragment>
            ))}

            <Button
              onClick={addPhoto}
              variant="text"
              size="small"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" height={18} width={18} />}
              sx={{
                px: '5px',
              }}
            >
              Add Photo
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServicePhotoSection;
