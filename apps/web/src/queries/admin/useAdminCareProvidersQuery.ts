import { useQuery } from "@tanstack/react-query";
import { ADMIN_CARE_PROVIDERS_QUERY } from "./keys";
import { fetchMockCareProviders } from "./mockData";

export function useAdminCareProvidersQuery() {
  return useQuery({
    queryKey: ADMIN_CARE_PROVIDERS_QUERY,
    queryFn: fetchMockCareProviders,
  });
}
