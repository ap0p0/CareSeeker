import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProviderDocument,
  replaceProviderDocument,
  uploadProviderDocument,
  type ProviderDocument,
  type ProviderDocumentList,
} from "./documents";
import {
  PROVIDER_DELETE_DOCUMENT_MUTATION,
  PROVIDER_DOCUMENTS_QUERY,
  PROVIDER_OVERVIEW_QUERY,
  PROVIDER_REPLACE_DOCUMENT_MUTATION,
  PROVIDER_UPLOAD_DOCUMENT_MUTATION,
} from "./keys";

const updateList = (
  current: ProviderDocumentList | undefined,
  mutate: (documents: ProviderDocument[]) => ProviderDocument[],
): ProviderDocumentList | undefined => {
  if (!current) return current;
  const documents = mutate(current.documents);
  return {
    documents,
    remainingSlots: Math.max(
      0,
      current.remainingSlots - (documents.length - current.documents.length),
    ),
  };
};

/** Document mutations keep the `PROVIDER_DOCUMENTS_QUERY` cache in sync. */
export const useUploadProviderDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_UPLOAD_DOCUMENT_MUTATION,
    mutationFn: uploadProviderDocument,
    onSuccess: (document) => {
      queryClient.setQueryData<ProviderDocumentList>(
        PROVIDER_DOCUMENTS_QUERY,
        (current) => updateList(current, (items) => [...items, document]),
      );
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
    },
  });
};

export const useReplaceProviderDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_REPLACE_DOCUMENT_MUTATION,
    mutationFn: replaceProviderDocument,
    onSuccess: (document) => {
      queryClient.setQueryData<ProviderDocumentList>(
        PROVIDER_DOCUMENTS_QUERY,
        (current) =>
          updateList(current, (items) =>
            items.map((item) => (item.id === document.id ? document : item)),
          ),
      );
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
    },
  });
};

export const useDeleteProviderDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: PROVIDER_DELETE_DOCUMENT_MUTATION,
    mutationFn: deleteProviderDocument,
    onSuccess: (_result, documentId) => {
      queryClient.setQueryData<ProviderDocumentList>(
        PROVIDER_DOCUMENTS_QUERY,
        (current) =>
          updateList(current, (items) =>
            items.filter((item) => item.id !== documentId),
          ),
      );
      void queryClient.invalidateQueries({ queryKey: PROVIDER_OVERVIEW_QUERY });
    },
  });
};
