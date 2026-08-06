import { useQuery } from "@tanstack/react-query";
import { ADMIN_DASHBOARD_QUERY } from "./keys";
import { fetchMockDashboard } from "./mockData";

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY,
    queryFn: fetchMockDashboard,
  });
}
