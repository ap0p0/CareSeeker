import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchMockCareProviders } from "./mockData";

export function useAdminCareProvidersQuery() {
  return useQuery({
    queryKey: queryKeys.admin.careProviders(),
    queryFn: fetchMockCareProviders,
  });
}
