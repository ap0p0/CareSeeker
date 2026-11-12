import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { ClientAuthApiError } from "./errors";
import type {
  CreateJobPayload,
  Job,
  JobDraftResponse,
  JobText,
  JobTextPayload,
} from "./jobs";
import { jobsService } from "./jobsService";
import {
  CLIENT_CREATE_JOB_MUTATION,
  CLIENT_GENERATE_JOB_TEXT_MUTATION,
  CLIENT_JOB_DRAFT_QUERY,
  CLIENT_OPEN_JOBS_QUERY,
} from "./keys";

/**
 * The prefilled draft of a new job post. A one-off snapshot for the page
 * that opened it: not kept once the page is left (so a later visit starts
 * from the current profile) and never refetched underneath the form.
 */
export const useJobDraftQuery = (
  options?: Omit<
    UseQueryOptions<JobDraftResponse, ClientAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: CLIENT_JOB_DRAFT_QUERY,
    queryFn: () => jobsService().fetchDraft(),
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    ...options,
  });

export const useGenerateJobTextMutation = (
  options?: Omit<
    UseMutationOptions<JobText, ClientAuthApiError, JobTextPayload>,
    "mutationFn" | "mutationKey"
  >,
) =>
  useMutation({
    mutationKey: CLIENT_GENERATE_JOB_TEXT_MUTATION,
    mutationFn: (payload: JobTextPayload) =>
      jobsService().generateText(payload),
    ...options,
  });

/** Posts a job; the open jobs list shows it right away. */
export const useCreateJobMutation = (
  options?: Omit<
    UseMutationOptions<Job, ClientAuthApiError, CreateJobPayload>,
    "mutationFn" | "mutationKey"
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CLIENT_CREATE_JOB_MUTATION,
    mutationFn: (payload: CreateJobPayload) => jobsService().createJob(payload),
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      void queryClient.invalidateQueries({ queryKey: CLIENT_OPEN_JOBS_QUERY });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
};
