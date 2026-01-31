import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import DealInfoItem from './DealInfoItem';
import EditableTextField from './EditableTextField';
import EditableDatePicker from './EditableDatePicker';
import EditableSelect from './EditableSelect';
import EditableCurrencyInput from './EditableCurrencyInput';
import EditablePercentageInput from './EditablePercentageInput';

const STAGE_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' }
];

const FORECAST_OPTIONS = [
  { value: 'best_case', label: 'Best Case' },
  { value: 'commit', label: 'Commit' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'omitted', label: 'Omitted' }
];

const DealInformation = ({ deal, updateDeal, dealInformation }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleFieldUpdate = async (field, value) => {
    try {
      await updateDeal({ [field]: value });
      enqueueSnackbar('Deal updated', { variant: 'success', autoHideDuration: 2000 });
    } catch (error) {
      enqueueSnackbar('Failed to update deal', { variant: 'error' });
      throw error; // Re-throw for EditableField to handle rollback
    }
  };

  // If new props not provided, fallback to old behavior
  if (!deal || !updateDeal) {
    return (
      <Paper component={Stack} direction="column" sx={{ p: { xs: 3, md: 5 }, gap: 3 }}>
        <Stack sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Deal Information
          </Typography>
        </Stack>
        <Stack direction="column" gap={2}>
          <div>
            {dealInformation.slice(0, 6).map((item) => (
              <DealInfoItem
                key={item.id}
                attribute={item.attribute}
                value={item.value}
                background={item.background}
              />
            ))}
          </div>
          <div>
            {dealInformation.slice(6).map((item) => (
              <DealInfoItem
                key={item.id}
                attribute={item.attribute}
                value={item.value}
                background={item.background}
              />
            ))}
          </div>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper component={Stack} direction="column" sx={{ p: { xs: 3, md: 5 }, gap: 3 }}>
      <Stack sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          Deal Information
        </Typography>
      </Stack>
      <Stack direction="column" gap={2}>
        {/* First group */}
        <div>
          <DealInfoItem attribute="Last updated" value={deal.updated_at} background={true} />

          <DealInfoItem attribute="Deal Details" background={false}>
            <EditableTextField
              value={deal.description}
              onSave={(value) => handleFieldUpdate('description', value)}
              label="Deal Details"
              multiline
              rows={3}
            />
          </DealInfoItem>

          <DealInfoItem attribute="Create Date" value={deal.created_at} background={true} />

          <DealInfoItem attribute="Created By" value={deal.created_by?.full_name || deal.created_by?.email || 'System'} background={false} />

          <DealInfoItem attribute="Current Stage" background={true}>
            <EditableSelect
              value={deal.stage}
              onSave={(value) => handleFieldUpdate('stage', value)}
              label="Current Stage"
              options={STAGE_OPTIONS}
              chipColor="primary"
            />
          </DealInfoItem>

          <DealInfoItem attribute="Closing Date" background={false}>
            <EditableDatePicker
              value={deal.close_date}
              onSave={(value) => handleFieldUpdate('close_date', value)}
              label="Closing Date"
            />
          </DealInfoItem>
        </div>

        {/* Second group */}
        <div>
          <DealInfoItem attribute="Associated Contact" value={deal.contact?.first_name} background={true} />

          <DealInfoItem attribute="Priority" value={deal.priority || 'not set'} background={false} />

          <DealInfoItem
            attribute="Deal Owner"
            value={deal.collaborators?.owner?.full_name || deal.collaborators?.owner?.email || 'N/A'}
            background={true}
          />

          <DealInfoItem
            attribute="Collaborating Agents"
            value={deal.collaborators?.collaborators?.map(c => c.full_name || c.email).join(', ') || 'None'}
            background={false}
          />

          <DealInfoItem attribute="Budget Forecast" background={true}>
            <EditableCurrencyInput
              value={deal.amount}
              onSave={(value) => handleFieldUpdate('amount', value)}
              label="Budget Forecast"
            />
          </DealInfoItem>

          <DealInfoItem attribute="Forecast Category" background={true}>
            <EditableSelect
              value={deal.forecast_category}
              onSave={(value) => handleFieldUpdate('forecast_category', value)}
              label="Forecast Category"
              options={FORECAST_OPTIONS}
            />
          </DealInfoItem>

          <DealInfoItem attribute="Deal Probability" background={false}>
            <EditablePercentageInput
              value={deal.probability}
              onSave={(value) => handleFieldUpdate('probability', value)}
              label="Deal Probability"
            />
          </DealInfoItem>
        </div>
      </Stack>
    </Paper>
  );
};

export default DealInformation;
