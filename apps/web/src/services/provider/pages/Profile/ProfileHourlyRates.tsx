import CompensationTravelCard from "../Overview/sections/CompensationTravelCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfileHourlyRates = () => (
  <ProviderProfileSectionPage
    title="Hourly rates"
    description="Your preferred and minimum rates, payment models and travel range."
  >
    {(overview) => (
      <CompensationTravelCard
        preferences={overview.workPreferences}
        title="Rates & travel"
      />
    )}
  </ProviderProfileSectionPage>
);

export default ProfileHourlyRates;
