/**
 * EditablePercentageInput - Inline editable percentage field component
 *
 * Architecture:
 * - Wraps EditableField with FilledInput + % adornment
 * - Auto-clamps values to 0-100 range
 * - Auto-save on blur or Enter key
 * - Used for Deal Probability field in deal details
 *
 * Usage:
 * <EditablePercentageInput
 *   value={deal.probability}
 *   onSave={async (newValue) => await updateDeal({ probability: newValue })}
 *   label="Deal Probability"
 * />
 *
 * Aurora Search: No percentage input patterns found in Aurora templates.
 * This is a custom PierceDesk pattern for inline editable percentage fields.
 */

import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

/**
 * Inline editable percentage input component
 * @param {number} value - Current percentage value (0-100)
 * @param {function} onSave - Async save handler (value) => Promise
 * @param {string} label - Field label for edit mode
 */
const EditablePercentageInput = ({ value, onSave, label }) => {
  const renderView = (currentValue, handleEdit) => (
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
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue !== null && currentValue !== undefined
          ? `${currentValue}%`
          : 'Click to set...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <FormControl variant="filled" fullWidth>
        <InputLabel>{label}</InputLabel>
        <FilledInput
          type="number"
          autoFocus
          value={editValue || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            setEditValue(Math.min(100, Math.max(0, val))); // Clamp 0-100
          }}
          onBlur={() => handleSave(editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancel();
            } else if (e.key === 'Enter') {
              handleSave(editValue);
            }
          }}
          endAdornment={<InputAdornment position="end">%</InputAdornment>}
          disabled={isSaving}
          inputProps={{ min: 0, max: 100, step: 1 }}
        />
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

export default EditablePercentageInput;
