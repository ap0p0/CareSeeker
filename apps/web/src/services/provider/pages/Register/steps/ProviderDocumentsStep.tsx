import { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  downloadProviderDocument,
  useDeleteProviderDocumentMutation,
  useProviderDocumentsQuery,
  useReplaceProviderDocumentMutation,
  useUploadProviderDocumentMutation,
  type ProviderDocument,
  type ProviderDocumentCategory,
} from "../../../../../queries/provider";
import DocumentDropzone from "../components/DocumentDropzone";
import DocumentItem, {
  type DocumentItemState,
} from "../components/DocumentItem";
import {
  DOCUMENT_CATEGORY_OPTIONS,
  validateDocumentFile,
} from "../documentOptions";

type ProviderDocumentsStepProps = {
  /** Navigation buttons are only rendered in the onboarding flow. */
  onBack?: () => void;
  onContinue?: () => void;
};

type PendingUpload = {
  localId: string;
  category: ProviderDocumentCategory;
  file: File;
  progress: number;
  error?: string;
};

type ReplaceState = { progress: number; error?: string };

const INLINE_VIEWABLE = new Set(["application/pdf", "image/jpeg", "image/png"]);

const newLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Onboarding step 3 — supporting documents. Stored documents come from the
 * API (so they survive navigating away and back); uploads in flight live in
 * local state with their own progress / error so one bad file never blocks
 * the others. Everything goes through the API — the UI has no idea which
 * storage backend holds the files.
 */
const ProviderDocumentsStep = ({
  onBack,
  onContinue,
}: ProviderDocumentsStepProps) => {
  const documentsQuery = useProviderDocumentsQuery();
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = documentsQuery;
  const uploadMutation = useUploadProviderDocumentMutation();
  const replaceMutation = useReplaceProviderDocumentMutation();
  const deleteMutation = useDeleteProviderDocumentMutation();

  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [replacing, setReplacing] = useState<Record<string, ReplaceState>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const updatePending = (localId: string, patch: Partial<PendingUpload>) =>
    setPending((current) =>
      current.map((item) =>
        item.localId === localId ? { ...item, ...patch } : item,
      ),
    );

  const removePending = (localId: string) =>
    setPending((current) => current.filter((item) => item.localId !== localId));

  const runUpload = async (upload: PendingUpload) => {
    updatePending(upload.localId, { progress: 0, error: undefined });

    try {
      await uploadMutation.mutateAsync({
        category: upload.category,
        file: upload.file,
        onProgress: (fraction) =>
          updatePending(upload.localId, { progress: fraction }),
      });
      removePending(upload.localId);
    } catch (error) {
      updatePending(upload.localId, {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
      });
    }
  };

  const handleFiles = (category: ProviderDocumentCategory, files: File[]) => {
    setActionError(null);

    const uploads: PendingUpload[] = files.map((file) => ({
      localId: newLocalId(),
      category,
      file,
      progress: 0,
      error: validateDocumentFile(file),
    }));

    setPending((current) => [...current, ...uploads]);
    for (const upload of uploads) {
      if (!upload.error) void runUpload(upload);
    }
  };

  const handleReplace = async (document: ProviderDocument, file: File) => {
    setActionError(null);
    const validation = validateDocumentFile(file);
    if (validation) {
      setReplacing((current) => ({
        ...current,
        [document.id]: { progress: 0, error: validation },
      }));
      return;
    }

    setReplacing((current) => ({ ...current, [document.id]: { progress: 0 } }));
    try {
      await replaceMutation.mutateAsync({
        documentId: document.id,
        file,
        onProgress: (fraction) =>
          setReplacing((current) => ({
            ...current,
            [document.id]: { progress: fraction },
          })),
      });
      setReplacing((current) => {
        const next = { ...current };
        delete next[document.id];
        return next;
      });
    } catch (error) {
      setReplacing((current) => ({
        ...current,
        [document.id]: {
          progress: 0,
          error:
            error instanceof Error
              ? error.message
              : "Could not replace the file. Please try again.",
        },
      }));
    }
  };

  const handleRemove = async (document: ProviderDocument) => {
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(document.id);
      setReplacing((current) => {
        const next = { ...current };
        delete next[document.id];
        return next;
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not remove the document. Please try again.",
      );
    }
  };

  const handleOpen = async (document: ProviderDocument) => {
    setActionError(null);
    const inline = INLINE_VIEWABLE.has(document.mimeType);
    // Open the tab synchronously (inside the click) so popup blockers allow it.
    const tab = inline ? window.open("", "_blank") : null;

    try {
      const blob = await downloadProviderDocument(
        document.id,
        inline ? "inline" : "attachment",
      );
      const url = URL.createObjectURL(blob);

      if (tab) {
        tab.location.href = url;
      } else {
        const anchor = window.document.createElement("a");
        anchor.href = url;
        anchor.download = document.originalFilename;
        anchor.click();
      }

      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      tab?.close();
      setActionError(
        error instanceof Error
          ? error.message
          : "Could not open the document. Please try again.",
      );
    }
  };

  const uploadsInFlight =
    pending.some((item) => !item.error) ||
    Object.values(replacing).some((state) => !state.error);
  const storedDocuments = queryData?.documents ?? [];

  const itemsFor = (category: ProviderDocumentCategory) => {
    const stored: { state: DocumentItemState; document: ProviderDocument }[] =
      storedDocuments
        .filter((document) => document.category === category)
        .map((document) => ({
          document,
          state: {
            kind: "stored",
            id: document.id,
            filename: document.originalFilename,
            sizeBytes: document.sizeBytes,
            mimeType: document.mimeType,
            progress: replacing[document.id]?.progress,
            error: replacing[document.id]?.error,
          },
        }));
    const local = pending.filter((item) => item.category === category);
    return { stored, local };
  };

  return (
    <Stack spacing={3} aria-busy={uploadsInFlight}>
      <Typography variant="body2" color="text.secondary">
        Documents are optional, but a CV and any certificates speed up
        verification and make your profile stand out.
        {onContinue
          ? " You can add or replace files later from your account settings."
          : ""}
      </Typography>

      {isErrorQuery ? (
        <Alert severity="error">
          Could not load your documents. You can still upload new ones.
        </Alert>
      ) : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}
      {queryData && queryData.remainingSlots === 0 ? (
        <Alert severity="warning">
          You have reached the maximum number of documents. Remove one to upload
          another.
        </Alert>
      ) : null}

      {isLoadingQuery ? (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        DOCUMENT_CATEGORY_OPTIONS.map((option, index) => {
          const { stored, local } = itemsFor(option.value);
          return (
            <Stack key={option.value} spacing={1.5}>
              {index > 0 ? <Divider /> : null}
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" component="h2" fontWeight={700}>
                  {option.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </Stack>

              {stored.map(({ state, document }) => (
                <DocumentItem
                  key={state.id}
                  item={state}
                  onOpen={() => void handleOpen(document)}
                  onReplace={(file) => void handleReplace(document, file)}
                  onRemove={() => void handleRemove(document)}
                />
              ))}
              {local.map((upload) => (
                <DocumentItem
                  key={upload.localId}
                  item={{
                    kind: "pending",
                    id: upload.localId,
                    filename: upload.file.name,
                    sizeBytes: upload.file.size,
                    mimeType: upload.file.type,
                    progress: upload.progress,
                    error: upload.error,
                  }}
                  onRetry={
                    upload.error && !validateDocumentFile(upload.file)
                      ? () => void runUpload(upload)
                      : undefined
                  }
                  onRemove={() => removePending(upload.localId)}
                />
              ))}

              <DocumentDropzone
                onFiles={(files) => handleFiles(option.value, files)}
                disabled={queryData?.remainingSlots === 0}
                label={
                  stored.length > 0
                    ? "Add more files"
                    : "Drag & drop files here, or click to browse"
                }
              />
            </Stack>
          );
        })
      )}

      {onBack || onContinue ? (
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
        >
          <Button
            type="button"
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            disabled={uploadsInFlight}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              color: "text.secondary",
            }}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="contained"
            size="large"
            onClick={onContinue}
            disabled={uploadsInFlight}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              minWidth: { sm: 220 },
            }}
          >
            {uploadsInFlight
              ? "Uploading…"
              : storedDocuments.length > 0
                ? "Continue"
                : "Continue without documents"}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ProviderDocumentsStep;
