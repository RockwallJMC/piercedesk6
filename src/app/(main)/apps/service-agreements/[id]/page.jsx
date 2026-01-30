import ServiceAgreementDetail from 'components/sections/service-agreements/detail';

const Page = ({ params }) => {
  return <ServiceAgreementDetail agreementId={params.id} />;
};

export default Page;
