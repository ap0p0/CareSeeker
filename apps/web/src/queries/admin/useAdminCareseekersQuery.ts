import { useQuery } from "@tanstack/react-query";
import { ADMIN_CARESEEKERS_QUERY } from "./keys";
import { fetchMockCareseekers } from "./mockData";

export function useAdminCareseekersQuery() {
  return useQuery({
    queryKey: ADMIN_CARESEEKERS_QUERY,
    queryFn: fetchMockCareseekers,
  });
}
