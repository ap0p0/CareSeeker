import { useState } from "react";
import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import {
  useProviderProfileQuery,
  useUpdateProviderProfileMutation,
  useUpdateProviderProfilePictureMutation,
} from "../../../../queries/provider";
import ProviderPersonalInfoStep from "../../pages/Register/steps/ProviderPersonalInfoStep";
import {
  personalInfoFormFromProfile,
  type ProviderPersonalInfoForm,
} from "../../pages/Register/types";
import {
  DATE_OF_BIRTH_FORMAT,
  normalizeUsPhone,
} from "../../pages/Register/validation";

/** Step 1 data, editable field by field (PATCH) with optional new picture. */
const PersonalInfoEditor = () => {
  const profileQuery = useProviderProfileQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = profileQuery;
  const updateMutation = useUpdateProviderProfileMutation();
  const pictureMutation = useUpdateProviderProfilePictureMutation();

  const [edits, setEdits] = useState<ProviderPersonalInfoForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoadingQuery) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (isErrorQuery || !queryData) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {profileQuery.error?.message ??
            "Could not load your personal information."}
        </Alert>
        <Button
          variant="contained"
          onClick={() => void profileQuery.refetch()}
          disabled={profileQuery.isFetching}
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

  const form = edits ?? personalInfoFormFromProfile(queryData);
  const submitting = updateMutation.isPending || pictureMutation.isPending;

  const handleSave = async () => {
    setError(null);
    setSaved(false);

    try {
      await updateMutation.mutateAsync({
        name: form.name.trim(),
        surname: form.surname.trim(),
        dateOfBirth: form.dateOfBirth?.format(DATE_OF_BIRTH_FORMAT) ?? "",
        gender: form.gender,
        phone: normalizeUsPhone(form.phone) ?? form.phone,
        addressLine1: form.addressLine1.trim(),
        city: form.city.trim(),
        state: form.state,
        postalCode: form.postalCode.trim(),
      });

      if (form.profilePicture) {
        await pictureMutation.mutateAsync(form.profilePicture);
      }

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
    <ProviderPersonalInfoStep
      mode="edit"
      value={form}
      onChange={(next) => {
        setEdits(next);
        setSaved(false);
      }}
      onSubmit={handleSave}
      submitting={submitting}
      submitLabel="Save changes"
      currentPictureUrl={queryData.profileImageUrl}
      statusMessage={saved ? "Your personal information was saved." : null}
      error={error}
    />
  );
};

export default PersonalInfoEditor;
