import { useState } from "react";
import {
  useSeekerRegistrantQuery,
  useUpdateSeekerRegistrantMutation,
} from "../../../../queries/client";
import RegistrantInfoStep from "../../pages/Register/steps/RegistrantInfoStep";
import {
  registrantFormFromSaved,
  toRegistrantUpdatePayload,
  type RegistrantInfoForm,
} from "../../pages/Register/types";
import {
  EditorLoadError,
  EditorLoading,
  saveErrorMessage,
} from "./EditorState";

/** Step 1 (the registrant), editable in place after the account exists. */
const RegistrantEditor = () => {
  const registrantQuery = useSeekerRegistrantQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = registrantQuery;
  const updateMutation = useUpdateSeekerRegistrantMutation();
  const [edits, setEdits] = useState<RegistrantInfoForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoadingQuery) return <EditorLoading />;

  if (isErrorQuery || !queryData) {
    return (
      <EditorLoadError
        message={
          registrantQuery.error?.message ?? "Could not load your details."
        }
        onRetry={() => void registrantQuery.refetch()}
        retrying={registrantQuery.isFetching}
      />
    );
  }

  const form = edits ?? registrantFormFromSaved(queryData);

  const handleSave = async () => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(toRegistrantUpdatePayload(form));
      setEdits(null);
      setSaved(true);
    } catch (caught) {
      setError(saveErrorMessage(caught));
    }
  };

  return (
    <RegistrantInfoStep
      mode="edit"
      value={form}
      onChange={(next) => {
        setEdits(next);
        setSaved(false);
      }}
      onSubmit={handleSave}
      submitting={updateMutation.isPending}
      submitLabel="Save changes"
      statusMessage={saved ? "Your details were saved." : null}
      error={error}
    />
  );
};

export default RegistrantEditor;
