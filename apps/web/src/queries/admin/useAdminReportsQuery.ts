import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchMockReports } from "./mockData";

export function useAdminReportsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.reports(),
    queryFn: fetchMockReports,
  });
}
