import ServicesCard from "../Overview/sections/ServicesCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfileServicesOffered = () => (
  <ProviderProfileSectionPage
    title="Services offered"
    description="The care services and skills you offer, and the jobs you are looking for."
  >
    {(overview) => (
      <ServicesCard
        serviceProfile={overview.serviceProfile}
        sections={["services", "jobs"]}
      />
    )}
  </ProviderProfileSectionPage>
);

export default ProfileServicesOffered;
