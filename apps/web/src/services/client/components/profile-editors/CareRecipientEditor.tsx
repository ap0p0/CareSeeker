import { useState } from "react";
import {
  useCareRecipientQuery,
  useSaveCareRecipientMutation,
} from "../../../../queries/client";
import RecipientPersonalInfoStep from "../../pages/Register/steps/RecipientPersonalInfoStep";
import {
  careRecipientFormFromSaved,
  toCareRecipientPayload,
  EMPTY_CARE_RECIPIENT,
  type CareRecipientForm,
} from "../../pages/Register/types";
import {
  EditorLoadError,
  EditorLoading,
  saveErrorMessage,
} from "./EditorState";

/** Step 2 (the person who needs care), editable in place. */
const CareRecipientEditor = () => {
  const recipientQuery = useCareRecipientQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = recipientQuery;
  const saveMutation = useSaveCareRecipientMutation();
  const [edits, setEdits] = useState<CareRecipientForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoadingQuery) return <EditorLoading />;

  if (isErrorQuery || !queryData) {
    return (
      <EditorLoadError
        message={
          recipientQuery.error?.message ??
          "Could not load the details of the person you care for."
        }
        onRetry={() => void recipientQuery.refetch()}
        retrying={recipientQuery.isFetching}
      />
    );
  }

  const form =
    edits ??
    (queryData.careRecipient
      ? careRecipientFormFromSaved(queryData.careRecipient)
      : EMPTY_CARE_RECIPIENT);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await saveMutation.mutateAsync(toCareRecipientPayload(form));
      setEdits(null);
      setSaved(true);
    } catch (caught) {
      setError(saveErrorMessage(caught));
    }
  };

  return (
    <RecipientPersonalInfoStep
      value={form}
      onChange={(next) => {
        setEdits(next);
        setSaved(false);
      }}
      onSubmit={handleSave}
      submitting={saveMutation.isPending}
      submitLabel="Save changes"
      statusMessage={saved ? "The details were saved." : null}
      error={error}
    />
  );
};

export default CareRecipientEditor;
