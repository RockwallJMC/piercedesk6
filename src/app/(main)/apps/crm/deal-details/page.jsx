import DealDetails from 'components/sections/crm/deal-details';

const Page = async ({ searchParams }) => {
  const params = await searchParams;
  const dealId = params.id;

  if (!dealId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Deal ID Required</h2>
        <p>Please provide a deal ID in the URL: ?id=[deal-id]</p>
      </div>
    );
  }

  return <DealDetails dealId={dealId} />;
};

export default Page;
