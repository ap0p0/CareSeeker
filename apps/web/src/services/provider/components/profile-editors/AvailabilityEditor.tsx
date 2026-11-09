import { useState } from "react";
import { Alert, Stack } from "@mui/material";
import {
  useProviderWorkPreferencesQuery,
  useSaveProviderWorkPreferencesMutation,
} from "../../../../queries/provider";
import ProviderWorkPreferencesStep from "../../pages/Register/steps/ProviderWorkPreferencesStep";
import {
  EMPTY_PROVIDER_WORK_PREFERENCES,
  workPreferencesFormFromSaved,
  type ProviderWorkPreferencesForm,
} from "../../pages/Register/types";
import { toScheduleDaysPayload } from "../../../../utils/weeklySchedule";
import {
  DATE_OF_BIRTH_FORMAT,
  dollarsToCents,
} from "../../pages/Register/validation";

/** Step 4 data; the step component guards against saving before it loaded. */
const AvailabilityEditor = () => {
  const query = useProviderWorkPreferencesQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = query;
  const saveMutation = useSaveProviderWorkPreferencesMutation();
  const [edits, setEdits] = useState<ProviderWorkPreferencesForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form =
    edits ??
    (queryData?.preferences
      ? workPreferencesFormFromSaved(queryData.preferences)
      : EMPTY_PROVIDER_WORK_PREFERENCES);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await saveMutation.mutateAsync({
        workingDays: toScheduleDaysPayload(form.days),
        workType: form.workType as "full_time" | "part_time" | "flexible",
        availabilityStart: form.availabilityStart,
        availableFrom:
          form.availabilityStart === "specific_date"
            ? (form.availableFrom?.format(DATE_OF_BIRTH_FORMAT) ?? null)
            : null,
        acceptsHourly: form.acceptsHourly,
        acceptsFixedPrice: form.acceptsFixedPrice,
        acceptsOneTimeJobs: form.acceptsOneTimeJobs,
        acceptsDailyJobs: form.acceptsDailyJobs,
        acceptsWeeklyJobs: form.acceptsWeeklyJobs,
        acceptsMonthlyJobs: form.acceptsMonthlyJobs,
        availableOvernight: form.availableOvernight,
        availableLiveIn: form.availableLiveIn,
        availableEmergency: form.availableEmergency,
        maxTravelDistanceMiles: form.maxTravelDistanceMiles,
        offersTransportation: form.offersTransportation,
        vehicleType: form.offersTransportation
          ? (form.vehicleType as Exclude<typeof form.vehicleType, "">)
          : null,
        vehicleWheelchairAccessible: form.offersTransportation
          ? form.vehicleWheelchairAccessible
          : null,
        minWeeklyHours: Number(form.minWeeklyHours),
        maxWeeklyHours: Number(form.maxWeeklyHours),
        preferredHourlyRateCents: dollarsToCents(form.preferredHourlyRate) ?? 0,
        minHourlyRateCents: dollarsToCents(form.minHourlyRate) ?? 0,
        matchingNotes: form.matchingNotes.trim() || null,
      });
      setEdits(null);
      setSaved(true);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save your changes. Please try again.",
      );
    }
  };

  return (
    <Stack spacing={2}>
      {saved ? (
        <Alert severity="success">
          Your availability and work preferences were saved.
        </Alert>
      ) : null}
      <ProviderWorkPreferencesStep
        value={form}
        onChange={(next) => {
          setEdits(next);
          setSaved(false);
        }}
        onSubmit={handleSave}
        submitting={saveMutation.isPending}
        submitLabel="Save changes"
        loading={isLoadingQuery}
        loadError={
          isErrorQuery
            ? (query.error?.message ?? "Could not load your availability.")
            : null
        }
        onRetryLoad={() => void query.refetch()}
        retryingLoad={query.isFetching}
        error={error}
      />
    </Stack>
  );
};

export default AvailabilityEditor;
