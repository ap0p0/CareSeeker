import { Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useProviderOverviewQuery } from "../../../../queries/provider";
import { ProviderPageShell, ProviderSubNav } from "../../components";
import { availabilitySubNavItems } from "../../navigation/subNavItems";
import AvailabilityCard from "../Overview/sections/AvailabilityCard";
import CompensationTravelCard from "../Overview/sections/CompensationTravelCard";

/** Weekly schedule and work conditions as saved in onboarding / settings. */
const AvailabilitySummary = () => {
  const overviewQuery = useProviderOverviewQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = overviewQuery;

  return (
    <ProviderPageShell
      title="Availability"
      description="Summary of your weekly availability and working conditions."
      subNav={
        <ProviderSubNav
          items={availabilitySubNavItems}
          ariaLabel="Availability sections"
        />
      }
      isLoading={isLoadingQuery}
      error={
        isErrorQuery
          ? (overviewQuery.error?.message ??
            "Could not load your availability.")
          : null
      }
      onRetry={() => void overviewQuery.refetch()}
    >
      {queryData ? (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <AvailabilityCard preferences={queryData.workPreferences} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CompensationTravelCard preferences={queryData.workPreferences} />
            </Grid>
          </Grid>
        </Stack>
      ) : null}
    </ProviderPageShell>
  );
};

export default AvailabilitySummary;
