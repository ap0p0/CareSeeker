import ClientPageHeader from "../components/ClientPageHeader";

type ClientSectionPageProps = {
  title: string;
};

const ClientSectionPage = ({ title }: ClientSectionPageProps) => {
  return <ClientPageHeader title={title} />;
};

export default ClientSectionPage;
