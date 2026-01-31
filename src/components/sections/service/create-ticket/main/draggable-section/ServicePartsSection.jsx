import { Fragment } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconifyIcon from 'components/base/IconifyIcon';
import NumberTextField from 'components/base/NumberTextField';
import EventFileDropHandler from 'components/sections/service/create-ticket/EventFileDropHandler';

const ServicePartsSection = ({ sectionIndex }) => {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.parts`,
  });

  const addPart = () => {
    append({
      name: '',
      manufacturer: '',
      partNumber: '',
      quantity: 1,
      unitCost: 0,
      userGuideUrl: '',
      partId: `part${fields.length + 1}`,
    });
  };

  const calculateTotal = (quantity, unitCost) => {
    const qty = Number(quantity) || 0;
    const cost = Number(unitCost) || 0;
    return (qty * cost).toFixed(2);
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
            {fields.map((field, index) => {
              const quantity = watch(`sections.${sectionIndex}.parts.${index}.quantity`) || 0;
              const unitCost = watch(`sections.${sectionIndex}.parts.${index}.unitCost`) || 0;
              const total = calculateTotal(quantity, unitCost);

              return (
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
                      <Typography variant="subtitle2">Part {index + 1}</Typography>
                      <IconButton color="error" onClick={() => remove(index)} size="small">
                        <IconifyIcon icon="material-symbols:delete-outline-rounded" fontSize={20} />
                      </IconButton>
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Part Name"
                          variant="filled"
                          error={!!errors?.sections?.[sectionIndex]?.parts?.[index]?.name}
                          helperText={errors?.sections?.[sectionIndex]?.parts?.[index]?.name?.message}
                          {...register(`sections.${sectionIndex}.parts.${index}.name`)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Manufacturer"
                          variant="filled"
                          error={!!errors?.sections?.[sectionIndex]?.parts?.[index]?.manufacturer}
                          helperText={errors?.sections?.[sectionIndex]?.parts?.[index]?.manufacturer?.message}
                          {...register(`sections.${sectionIndex}.parts.${index}.manufacturer`)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Part Number"
                          variant="filled"
                          error={!!errors?.sections?.[sectionIndex]?.parts?.[index]?.partNumber}
                          helperText={errors?.sections?.[sectionIndex]?.parts?.[index]?.partNumber?.message}
                          {...register(`sections.${sectionIndex}.parts.${index}.partNumber`)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Product Link / User Guide URL"
                          variant="filled"
                          error={!!errors?.sections?.[sectionIndex]?.parts?.[index]?.userGuideUrl}
                          helperText={errors?.sections?.[sectionIndex]?.parts?.[index]?.userGuideUrl?.message}
                          {...register(`sections.${sectionIndex}.parts.${index}.userGuideUrl`)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <NumberTextField
                          fullWidth
                          label="Quantity"
                          variant="filled"
                          error={!!errors?.sections?.[sectionIndex]?.parts?.[index]?.quantity}
                          helperText={errors?.sections?.[sectionIndex]?.parts?.[index]?.quantity?.message}
                          {...register(`sections.${sectionIndex}.parts.${index}.quantity`, {
                            setValueAs: (value) => Number(value),
                          })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <NumberTextField
                          fullWidth
                          label="Unit Cost"
                          placeholder="$0.00"
                          variant="filled"
                          error={!!errors?.sections?.[sectionIndex]?.parts?.[index]?.unitCost}
                          helperText={errors?.sections?.[sectionIndex]?.parts?.[index]?.unitCost?.message}
                          {...register(`sections.${sectionIndex}.parts.${index}.unitCost`, {
                            setValueAs: (value) => Number(value),
                          })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Total"
                          value={`$${total}`}
                          variant="filled"
                          disabled
                          slotProps={{
                            input: {
                              readOnly: true,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Fragment>
              );
            })}

            <Button
              onClick={addPart}
              variant="text"
              size="small"
              color="neutral"
              startIcon={<IconifyIcon icon="material-symbols:add-rounded" height={18} width={18} />}
              sx={{
                px: '5px',
              }}
            >
              Add Part
            </Button>
          </Box>
        </Grid>

        <Grid size={12}>
          <Stack direction="column" spacing={2}>
            <EventFileDropHandler imagesField={`sections.${sectionIndex}.images`} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ServicePartsSection;
