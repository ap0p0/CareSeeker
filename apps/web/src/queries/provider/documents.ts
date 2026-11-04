import type { AxiosProgressEvent } from "axios";
import {
  getApiErrorCode,
  getApiErrorMessage,
  httpClient,
} from "../../api/httpClient";
import { getAccessToken } from "../../supabase/session";
import { ProviderAuthApiError } from "./errors";

export const PROVIDER_DOCUMENTS_PATH = "/provider/documents" as const;

export type ProviderDocumentCategory =
  | "cv_resume"
  | "reference_letter"
  | "educational_certificate"
  | "professional_certificate"
  | "medical_license_permit"
  | "other";

/** Document metadata as returned by the API (storage details stay server-side). */
export type ProviderDocument = {
  id: string;
  providerId: string;
  category: ProviderDocumentCategory;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

export type ProviderDocumentList = {
  documents: ProviderDocument[];
  remainingSlots: number;
};

export type UploadProviderDocumentPayload = {
  category: ProviderDocumentCategory;
  file: File;
  onProgress?: (fraction: number) => void;
};

export type ReplaceProviderDocumentPayload = {
  documentId: string;
  file: File;
  category?: ProviderDocumentCategory;
  onProgress?: (fraction: number) => void;
};

type UploadResult = {
  documents: ProviderDocument[];
  rejected: { filename: string; reason: string }[];
};

const requireAuthHeaders = async () => {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new ProviderAuthApiError(
      "Your session expired. Please sign in again.",
    );
  }

  return { Authorization: `Bearer ${accessToken}` };
};

const toProgressHandler =
  (onProgress?: (fraction: number) => void) => (event: AxiosProgressEvent) => {
    if (!onProgress) return;
    const total = event.total ?? 0;
    onProgress(total > 0 ? Math.min(1, event.loaded / total) : 0);
  };

/** API messages are prefixed with `"<filename>": ` for multi-file uploads; the UI shows the name already. */
const stripFilenamePrefix = (message: string) =>
  message.replace(/^"[^"]*": /, "");

const toApiError = (error: unknown, fallback: string) =>
  new ProviderAuthApiError(
    stripFilenamePrefix(getApiErrorMessage(error, fallback)),
    getApiErrorCode(error) === "VALIDATION_ERROR"
      ? "VALIDATION_ERROR"
      : "UNKNOWN_ERROR",
  );

export const fetchProviderDocuments =
  async (): Promise<ProviderDocumentList> => {
    const headers = await requireAuthHeaders();

    try {
      const { data } = await httpClient.get<ProviderDocumentList>(
        PROVIDER_DOCUMENTS_PATH,
        { headers },
      );
      return data;
    } catch (error) {
      throw toApiError(error, "Could not load your documents.");
    }
  };

/** Uploads one file (one request per file keeps progress and errors per file). */
export const uploadProviderDocument = async ({
  category,
  file,
  onProgress,
}: UploadProviderDocumentPayload): Promise<ProviderDocument> => {
  const headers = await requireAuthHeaders();
  const formData = new FormData();
  formData.append("category", category);
  formData.append("files", file, file.name);

  let result: UploadResult;
  try {
    const { data } = await httpClient.post<UploadResult>(
      PROVIDER_DOCUMENTS_PATH,
      formData,
      {
        headers: { ...headers, "Content-Type": undefined },
        onUploadProgress: toProgressHandler(onProgress),
      },
    );
    result = data;
  } catch (error) {
    throw toApiError(error, "Could not upload the file. Please try again.");
  }

  const document = result.documents[0];
  if (!document) {
    throw new ProviderAuthApiError(
      stripFilenamePrefix(
        result.rejected[0]?.reason ?? "The file was not accepted.",
      ),
      "VALIDATION_ERROR",
    );
  }

  return document;
};

export const replaceProviderDocument = async ({
  documentId,
  file,
  category,
  onProgress,
}: ReplaceProviderDocumentPayload): Promise<ProviderDocument> => {
  const headers = await requireAuthHeaders();
  const formData = new FormData();
  if (category) formData.append("category", category);
  formData.append("file", file, file.name);

  try {
    const { data } = await httpClient.put<ProviderDocument>(
      `${PROVIDER_DOCUMENTS_PATH}/${documentId}`,
      formData,
      {
        headers: { ...headers, "Content-Type": undefined },
        onUploadProgress: toProgressHandler(onProgress),
      },
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Could not replace the file. Please try again.");
  }
};

export const deleteProviderDocument = async (
  documentId: string,
): Promise<void> => {
  const headers = await requireAuthHeaders();

  try {
    await httpClient.delete(`${PROVIDER_DOCUMENTS_PATH}/${documentId}`, {
      headers,
    });
  } catch (error) {
    throw toApiError(error, "Could not remove the document. Please try again.");
  }
};

/**
 * Fetches the file through the authenticated endpoint. The caller decides
 * whether to open it (PDF / images) or save it.
 */
export const downloadProviderDocument = async (
  documentId: string,
  disposition: "inline" | "attachment" = "attachment",
): Promise<Blob> => {
  const headers = await requireAuthHeaders();

  try {
    const { data } = await httpClient.get<Blob>(
      `${PROVIDER_DOCUMENTS_PATH}/${documentId}/download`,
      { headers, params: { disposition }, responseType: "blob" },
    );
    return data;
  } catch (error) {
    throw toApiError(error, "Could not open the document. Please try again.");
  }
};
