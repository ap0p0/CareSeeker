import ServicesCard from "../Overview/sections/ServicesCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfileLanguages = () => (
  <ProviderProfileSectionPage
    title="Languages"
    description="The languages you can provide care in."
  >
    {(overview) => (
      <ServicesCard
        serviceProfile={overview.serviceProfile}
        sections={["languages"]}
        title="Languages"
      />
    )}
  </ProviderProfileSectionPage>
);

export default ProfileLanguages;
