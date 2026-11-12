import { useMemo } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
  canEditJob,
  editLockedReason,
  useClientJobQuery,
  useSeekerOnboardingQuery,
} from "../../../../queries/client";
import JobPostEditor from "../NewJob/JobPostEditor";
import { jobPostFormFromDraft } from "../NewJob/jobPostForm";
import { JobLoadError, JobLoading, JobMessage, JobNotFound } from "./JobStates";
import { jobPath } from "./jobLinks";

/**
 * `/jobs/:jobId/edit` — change a job's requirements, with the same form as
 * a new post. Only open jobs can be edited (`jobPolicies`); for any other
 * job the page explains why instead of showing the form (the mock service
 * refuses the save as well).
 */
const EditJobPage = () => {
  const { jobId = "" } = useParams();
  // Opened from the job page: saving / discarding goes back there.
  const returnTo = (useLocation().state as { returnTo?: string } | null)
    ?.returnTo;
  const jobQuery = useClientJobQuery(jobId);
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = jobQuery;
  // For the form copy ("Select everything Walter needs help with").
  const { data: onboarding } = useSeekerOnboardingQuery();
  const initialForm = useMemo(
    () => (queryData ? jobPostFormFromDraft(queryData) : null),
    [queryData],
  );

  if (isLoadingQuery) return <JobLoading />;
  if (isErrorQuery) {
    return <JobLoadError onRetry={() => void jobQuery.refetch()} />;
  }
  if (!queryData || !initialForm) return <JobNotFound />;

  if (!canEditJob(queryData)) {
    return (
      <JobMessage title="This job can’t be edited">
        <Typography color="text.secondary">“{queryData.title}”</Typography>
        <Alert severity="info">{editLockedReason(queryData)}</Alert>
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={jobPath(queryData.jobId)}
            variant="contained"
            sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
          >
            View job
          </Button>
        </Stack>
      </JobMessage>
    );
  }

  return (
    <JobPostEditor
      key={queryData.jobId}
      initialForm={initialForm}
      intent={{ kind: "edit", jobId: queryData.jobId, returnTo }}
      recipientName={onboarding?.careRecipient?.name}
    />
  );
};

export default EditJobPage;
