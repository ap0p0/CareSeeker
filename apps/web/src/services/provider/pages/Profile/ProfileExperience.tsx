import ServicesCard from "../Overview/sections/ServicesCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfileExperience = () => (
  <ProviderProfileSectionPage
    title="Experience"
    description="Your years of experience, previous care work and personal introduction."
  >
    {(overview) => (
      <ServicesCard
        serviceProfile={overview.serviceProfile}
        sections={["experience"]}
        title="Experience"
      />
    )}
  </ProviderProfileSectionPage>
);

export default ProfileExperience;
