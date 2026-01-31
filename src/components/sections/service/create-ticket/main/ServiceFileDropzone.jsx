import { useFormContext } from 'react-hook-form';
import { Paper, Typography } from '@mui/material';
import FileDropZone from 'components/base/FileDropZone';

const ServiceFileDropzone = () => {
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext();

  const serviceFiles = watch('serviceFiles');

  const handleDrop = (acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({ id: file.name, file }));
    setValue('serviceFiles', [...(serviceFiles || []), ...newFiles]);
    trigger('serviceFiles');
  };

  const handleRemove = (index) => {
    const updatedFiles = serviceFiles.filter((_, i) => i !== index);
    setValue('serviceFiles', updatedFiles);
    trigger('serviceFiles');
  };

  return (
    <Paper background={1} sx={{ p: 3, borderRadius: 6, outline: 0 }}>
      <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 700 }}>
        Site Photos & Attachments
      </Typography>
      <FileDropZone
        accept={{
          'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
          'application/pdf': ['.pdf'],
        }}
        previewType="thumbnail"
        onDrop={handleDrop}
        onRemove={handleRemove}
        defaultFiles={serviceFiles?.map((file) => file.file) || []}
        error={errors.serviceFiles?.message}
      />
    </Paper>
  );
};

export default ServiceFileDropzone;
