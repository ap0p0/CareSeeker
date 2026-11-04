import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchProviderDocuments, type ProviderDocumentList } from "./documents";
import type { ProviderAuthApiError } from "./errors";
import { PROVIDER_DOCUMENTS_QUERY } from "./keys";

export const useProviderDocumentsQuery = (
  options?: Omit<
    UseQueryOptions<ProviderDocumentList, ProviderAuthApiError>,
    "queryKey" | "queryFn"
  >,
) =>
  useQuery({
    queryKey: PROVIDER_DOCUMENTS_QUERY,
    queryFn: fetchProviderDocuments,
    ...options,
  });
