import { useState } from "react";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import {
  useProviderServiceProfileQuery,
  useSaveProviderServiceProfileMutation,
} from "../../../../queries/provider";
import ProviderServicesJobsStep from "../../pages/Register/steps/ProviderServicesJobsStep";
import {
  EMPTY_PROVIDER_SERVICES_JOBS,
  servicesJobsFormFromProfile,
  type ProviderServicesJobsForm,
} from "../../pages/Register/types";

/** Step 2 data; the whole section is re-saved with `PUT` (idempotent). */
const ServicesEditor = () => {
  const query = useProviderServiceProfileQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = query;
  const saveMutation = useSaveProviderServiceProfileMutation();
  const [edits, setEdits] = useState<ProviderServicesJobsForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoadingQuery) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (isErrorQuery) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {query.error?.message ?? "Could not load your services."}
        </Alert>
        <Button
          variant="contained"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          sx={{
            alignSelf: "flex-start",
            borderRadius: 999,
            textTransform: "none",
          }}
        >
          Try again
        </Button>
      </Stack>
    );
  }

  const form =
    edits ??
    (queryData?.profile
      ? servicesJobsFormFromProfile(queryData.profile)
      : EMPTY_PROVIDER_SERVICES_JOBS);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await saveMutation.mutateAsync({
        careServices: form.careServices,
        otherCareService: form.otherCareService.trim(),
        skills: form.skills,
        otherSkill: form.otherSkill.trim(),
        yearsOfExperience: Number(form.yearsOfExperience),
        previousCareExperience: form.previousCareExperience.trim(),
        qualifications: form.qualifications,
        otherQualification: form.otherQualification.trim(),
        languages: form.languages,
        otherLanguage: form.otherLanguage.trim(),
        coverLetter: form.coverLetter.trim(),
        jobCategories: form.jobCategories,
        tasksWilling: form.tasksWilling,
        tasksUnwilling: form.tasksUnwilling,
        clientGroups: form.clientGroups,
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
          Your services and job interests were saved.
        </Alert>
      ) : null}
      <ProviderServicesJobsStep
        value={form}
        onChange={(next) => {
          setEdits(next);
          setSaved(false);
        }}
        onSubmit={handleSave}
        submitting={saveMutation.isPending}
        submitLabel="Save changes"
        error={error}
      />
    </Stack>
  );
};

export default ServicesEditor;
