import { useState } from "react";
import {
  useCarePreferencesQuery,
  useSaveCarePreferencesMutation,
} from "../../../../queries/client";
import {
  carePreferencesFormFromSaved,
  EMPTY_CARE_PREFERENCES,
  toCarePreferencesPayload,
  type CarePreferencesForm,
} from "../../pages/Register/carePreferencesForm";
import CareNeedsStep from "../../pages/Register/steps/CareNeedsStep";
import {
  EditorLoadError,
  EditorLoading,
  saveErrorMessage,
} from "./EditorState";

type CarePreferencesEditorProps = {
  /** First name of the person receiving care, for the form copy. */
  recipientName?: string;
};

/** Step 3 (care needs & assistance preferences), editable in place. */
const CarePreferencesEditor = ({
  recipientName,
}: CarePreferencesEditorProps) => {
  const preferencesQuery = useCarePreferencesQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = preferencesQuery;
  const saveMutation = useSaveCarePreferencesMutation();
  const [edits, setEdits] = useState<CarePreferencesForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoadingQuery) return <EditorLoading />;

  if (isErrorQuery || !queryData) {
    return (
      <EditorLoadError
        message={
          preferencesQuery.error?.message ??
          "Could not load the care preferences."
        }
        onRetry={() => void preferencesQuery.refetch()}
        retrying={preferencesQuery.isFetching}
      />
    );
  }

  const form =
    edits ??
    (queryData.preferences
      ? carePreferencesFormFromSaved(queryData.preferences)
      : EMPTY_CARE_PREFERENCES);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await saveMutation.mutateAsync(toCarePreferencesPayload(form));
      setEdits(null);
      setSaved(true);
    } catch (caught) {
      setError(saveErrorMessage(caught));
    }
  };

  return (
    <CareNeedsStep
      value={form}
      onChange={(next) => {
        setEdits(next);
        setSaved(false);
      }}
      onSubmit={handleSave}
      submitting={saveMutation.isPending}
      submitLabel="Save changes"
      statusMessage={saved ? "The care preferences were saved." : null}
      error={error}
      recipientName={recipientName}
    />
  );
};

export default CarePreferencesEditor;
