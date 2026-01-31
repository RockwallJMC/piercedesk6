/**
 * EditableSelect - Inline editable select/dropdown field
 *
 * Architecture:
 * - Wraps EditableField with MUI Select component
 * - Auto-saves on selection (no explicit save button needed)
 * - Shows Chip in view mode with color variants
 * - Used for Current Stage and Forecast Category fields
 *
 * Usage:
 * <EditableSelect
 *   value={deal.current_stage}
 *   onSave={async (newStage) => await updateDeal({ current_stage: newStage })}
 *   label="Current Stage"
 *   options={[
 *     { value: 'qualification', label: 'Qualification' },
 *     { value: 'proposal', label: 'Proposal' }
 *   ]}
 *   chipColor="primary"
 * />
 *
 * Aurora Search: No inline select patterns found in Aurora templates.
 * This is a custom PierceDesk pattern for inline editable select fields.
 */

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

/**
 * Inline editable select field with Chip display
 * @param {string} value - Current selected value
 * @param {function} onSave - Async save handler (newValue) => Promise
 * @param {string} label - Field label for the select
 * @param {Array} options - Array of {value, label} objects
 * @param {string} chipColor - MUI color variant for Chip (default, primary, secondary, etc.)
 */
const EditableSelect = ({ value, onSave, label, options, chipColor = 'default' }) => {
  const renderView = (currentValue, handleEdit) => {
    const selectedOption = options.find(opt => opt.value === currentValue);

    return (
      <Stack
        direction="row"
        gap={1}
        onClick={handleEdit}
        sx={{
          cursor: 'pointer',
          p: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
            '& .edit-icon': { opacity: 1 }
          }
        }}
      >
        {selectedOption ? (
          <Chip
            label={selectedOption.label}
            variant="soft"
            color={chipColor}
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click to select...
          </Typography>
        )}
        <IconifyIcon
          icon="material-symbols:edit-outline"
          className="edit-icon"
          sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
        />
      </Stack>
    );
  };

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <FormControl variant="filled" fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={editValue || ''}
          onChange={(e) => {
            setEditValue(e.target.value);
            handleSave(e.target.value);
          }}
          onBlur={handleCancel}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
          disabled={isSaving}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
    </Stack>
  );

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditableSelect;
