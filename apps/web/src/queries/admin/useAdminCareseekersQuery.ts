import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchMockCareseekers } from "./mockData";

export function useAdminCareseekersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.careseekers(),
    queryFn: fetchMockCareseekers,
  });
}
