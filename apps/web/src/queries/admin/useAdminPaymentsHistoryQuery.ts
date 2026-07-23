import { useQuery } from "@tanstack/react-query";
import { ADMIN_PAYMENTS_HISTORY_QUERY } from "./keys";
import { fetchMockPayments } from "./mockData";

export function useAdminPaymentsHistoryQuery() {
  return useQuery({
    queryKey: ADMIN_PAYMENTS_HISTORY_QUERY,
    queryFn: fetchMockPayments,
  });
}
