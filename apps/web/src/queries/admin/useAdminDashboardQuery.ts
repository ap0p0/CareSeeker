import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchMockDashboard } from "./mockData";

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: fetchMockDashboard,
  });
}
