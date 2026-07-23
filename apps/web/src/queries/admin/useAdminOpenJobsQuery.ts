import { useQuery } from "@tanstack/react-query";
import { ADMIN_OPEN_JOBS_QUERY } from "./keys";
import { fetchMockOpenJobs } from "./mockData";

export function useAdminOpenJobsQuery() {
  return useQuery({
    queryKey: ADMIN_OPEN_JOBS_QUERY,
    queryFn: fetchMockOpenJobs,
  });
}
