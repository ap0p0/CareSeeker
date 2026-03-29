import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchMockOpenJobs } from "./mockData";

export function useAdminOpenJobsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.openJobs(),
    queryFn: fetchMockOpenJobs,
  });
}
