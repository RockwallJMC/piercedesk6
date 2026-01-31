import { Button, Paper, Stack } from '@mui/material';
import paths from 'routes/paths';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import ContactsListContainer from './ContactsListContainer';

const ContactsList = () => {
  return (
    <Stack direction="column" height={1}>
      <PageHeader
        title="Contacts"
        breadcrumb={[
          { label: 'Home', url: '/' },
          { label: 'CRM', url: paths.contacts },
          { label: 'Contacts', active: true },
        ]}
        actionComponent={
          <Stack gap={1}>
            <Button variant="soft" color="neutral">
              Export
            </Button>
            <Button variant="soft" color="neutral">
              Import
            </Button>
            <Button variant="contained" color="primary" href={paths.addContact}>
              Add Contact
            </Button>
          </Stack>
        }
      />
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <ContactsListContainer />
      </Paper>
    </Stack>
  );
};

export default ContactsList;
