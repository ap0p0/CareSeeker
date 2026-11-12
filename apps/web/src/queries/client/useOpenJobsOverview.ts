import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ClientJobDetails } from "./jobDetailsMock";
import type { JobClosureReason } from "./jobPolicies";
import type { CreateJobPayload } from "./jobs";
import { jobsService } from "./jobsService";
import {
  CLIENT_CLOSE_JOB_MUTATION,
  CLIENT_JOB_DETAILS_QUERY,
  CLIENT_JOB_QUERY,
  CLIENT_OPEN_JOBS_QUERY,
  CLIENT_PAUSE_JOB_MUTATION,
  CLIENT_REQUEST_JOB_CLOSURE_MUTATION,
  CLIENT_RESUME_JOB_MUTATION,
  CLIENT_UPDATE_JOB_MUTATION,
} from "./keys";
import type { ClientJobError, ClientJobOverview } from "./openJobsOverview";

/**
 * The job screens' data: the signed-in seeker's real jobs, or the sample
 * data in a demo session (`jobsService`). `empty` previews the empty open
 * jobs page in a demo.
 */
export const useClientOpenJobsQuery = ({ empty = false } = {}) =>
  useQuery({
    queryKey: [...CLIENT_OPEN_JOBS_QUERY, { empty }],
    queryFn: () => jobsService().listOpenJobs({ empty }),
  });

/** One job by its public `jobId` (finished ones included); `null` if none. */
export const useClientJobQuery = (jobId: string) =>
  useQuery({
    queryKey: [...CLIENT_JOB_QUERY, jobId],
    queryFn: () => jobsService().getJob(jobId),
  });

/** Everything the job page shows. */
export const useClientJobDetailsQuery = (jobId: string) =>
  useQuery({
    queryKey: [...CLIENT_JOB_DETAILS_QUERY, jobId],
    queryFn: () => jobsService().getJobDetails(jobId),
  });

/** Every change to a job refreshes the list, that job and its page. */
const useJobMutation = <Variables>(
  mutationKey: readonly string[],
  mutationFn: (variables: Variables) => Promise<ClientJobOverview>,
) => {
  const queryClient = useQueryClient();

  return useMutation<ClientJobOverview, ClientJobError, Variables>({
    mutationKey,
    mutationFn,
    onSuccess: (job) => {
      queryClient.setQueryData([...CLIENT_JOB_QUERY, job.jobId], job);
      // Show the new state on the job page at once; the refetch then
      // brings what derives from it (activity…).
      const detailsKey = [...CLIENT_JOB_DETAILS_QUERY, job.jobId];
      queryClient.setQueryData<ClientJobDetails | null>(detailsKey, (old) =>
        old ? { ...old, job } : old,
      );
      void queryClient.invalidateQueries({ queryKey: detailsKey });
      void queryClient.invalidateQueries({ queryKey: CLIENT_OPEN_JOBS_QUERY });
    },
  });
};

/** Saves an edited job post (open jobs only). */
export const useUpdateClientJobMutation = () =>
  useJobMutation(
    CLIENT_UPDATE_JOB_MUTATION,
    ({ jobId, payload }: { jobId: string; payload: CreateJobPayload }) =>
      jobsService().updateJob(jobId, payload),
  );

/** Closes an open job (moves it to the archive). */
export const useCloseClientJobMutation = () =>
  useJobMutation(CLIENT_CLOSE_JOB_MUTATION, ({ jobId }: { jobId: string }) =>
    jobsService().closeJob(jobId),
  );

/** Hides an open job from caregivers. */
export const usePauseClientJobMutation = () =>
  useJobMutation(CLIENT_PAUSE_JOB_MUTATION, ({ jobId }: { jobId: string }) =>
    jobsService().pauseJob(jobId),
  );

/** Makes a paused job open again. */
export const useResumeClientJobMutation = () =>
  useJobMutation(CLIENT_RESUME_JOB_MUTATION, ({ jobId }: { jobId: string }) =>
    jobsService().resumeJob(jobId),
  );

/**
 * Asks an admin to close a job past the "open" stage. Only the sample data
 * supports this yet (`jobsService().requestClosure`).
 */
export const useRequestJobClosureMutation = () =>
  useJobMutation(
    CLIENT_REQUEST_JOB_CLOSURE_MUTATION,
    ({
      jobId,
      reason,
      explanation,
    }: {
      jobId: string;
      reason: JobClosureReason;
      explanation: string;
    }) => {
      const request = jobsService().requestClosure;
      if (!request) {
        return Promise.reject(
          new Error("Closure requests are not available yet."),
        );
      }
      return request(jobId, { reason, explanation });
    },
  );

/** Whether closure requests can be sent in this session. */
export const closureRequestsAvailable = (): boolean =>
  jobsService().requestClosure !== null;
