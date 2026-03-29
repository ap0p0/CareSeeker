import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import { fetchMockPayments } from "./mockData";

export function useAdminPaymentsHistoryQuery() {
  return useQuery({
    queryKey: queryKeys.admin.paymentsHistory(),
    queryFn: fetchMockPayments,
  });
}
