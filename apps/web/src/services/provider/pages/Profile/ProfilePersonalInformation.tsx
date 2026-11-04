import ProfileSummaryCard from "../Overview/sections/ProfileSummaryCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfilePersonalInformation = () => (
  <ProviderProfileSectionPage
    title="Personal information"
    description="Your name, contact details and address as care seekers will see them."
  >
    {(overview) => <ProfileSummaryCard overview={overview} />}
  </ProviderProfileSectionPage>
);

export default ProfilePersonalInformation;
