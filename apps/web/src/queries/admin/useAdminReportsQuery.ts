import { useQuery } from "@tanstack/react-query";
import { ADMIN_REPORTS_QUERY } from "./keys";
import { fetchMockReports } from "./mockData";

export function useAdminReportsQuery() {
  return useQuery({
    queryKey: ADMIN_REPORTS_QUERY,
    queryFn: fetchMockReports,
  });
}
