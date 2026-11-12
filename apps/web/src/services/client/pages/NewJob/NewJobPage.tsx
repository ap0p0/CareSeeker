import { useMemo } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useJobDraftQuery } from "../../../../queries/client";
import JobPostEditor from "./JobPostEditor";
import JobStartChooser from "./JobStartChooser";
import { EMPTY_JOB_POST_FORM, jobPostFormFromDraft } from "./jobPostForm";
import { newJobPath, parseJobStartMode } from "./jobStartMode";

/**
 * The post prefilled from the account (`GET /seeker/jobs/draft`: the care
 * recipient's city / state / ZIP, the saved care needs and a generated
 * title and description), then edited like any other post.
 */
const PrefilledJobPost = () => {
  const draftQuery = useJobDraftQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = draftQuery;
  const initialForm = useMemo(
    () => (queryData ? jobPostFormFromDraft(queryData.draft) : null),
    [queryData],
  );

  if (isLoadingQuery) {
    return (
      <Stack alignItems="center" justifyContent="center" py={10} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">Preparing your job post…</Typography>
      </Stack>
    );
  }

  if (isErrorQuery || !queryData || !initialForm) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => void draftQuery.refetch()}
            disabled={draftQuery.isFetching}
          >
            Retry
          </Button>
        }
      >
        {draftQuery.error?.message ?? "Could not prepare your job post."}
      </Alert>
    );
  }

  return (
    <JobPostEditor
      initialForm={initialForm}
      intent={{
        kind: "create",
        mode: "prefill",
        prefilled: queryData.source !== null,
      }}
      recipientName={queryData.source?.careRecipientName}
    />
  );
};

/**
 * `/jobs/new` — two entry points:
 * - after registration ("Confirm and open a job now") the review page opens
 *   `?mode=prefill`: the post is prefilled from the account right away;
 * - "Add New Job" opens `/jobs/new`, which first asks how to start:
 *   prefilled with the account info, or an empty form (`?mode=blank`).
 * Both modes use the same editor (`JobPostEditor`).
 */
const NewJobPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = parseJobStartMode(searchParams);

  if (!mode) {
    return (
      <JobStartChooser
        onChoose={(next) => {
          // A new history entry: "Back" returns to this choice.
          navigate(newJobPath(next));
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return mode === "prefill" ? (
    <PrefilledJobPost key="prefill" />
  ) : (
    <JobPostEditor
      key="blank"
      initialForm={EMPTY_JOB_POST_FORM}
      intent={{ kind: "create", mode: "blank", prefilled: false }}
    />
  );
};

export default NewJobPage;
