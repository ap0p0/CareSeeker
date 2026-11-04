import { useRef } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DOCUMENT_ACCEPT, formatFileSize } from "../documentOptions";

/** Either a document stored on the server or a local upload in flight. */
export type DocumentItemState =
  | {
      kind: "stored";
      id: string;
      filename: string;
      sizeBytes: number;
      mimeType: string;
      /** Set while a replace upload is running. */
      progress?: number;
      error?: string;
    }
  | {
      kind: "pending";
      id: string;
      filename: string;
      sizeBytes: number;
      mimeType: string;
      progress: number;
      error?: string;
    };

type DocumentItemProps = {
  item: DocumentItemState;
  disabled?: boolean;
  onOpen?: () => void;
  onReplace?: (file: File) => void;
  onRetry?: () => void;
  onRemove: () => void;
};

const FileIcon = ({ mimeType }: { mimeType: string }) => {
  if (mimeType === "application/pdf") {
    return <PictureAsPdfOutlinedIcon color="action" />;
  }
  if (mimeType.startsWith("image/")) {
    return <ImageOutlinedIcon color="action" />;
  }
  return <DescriptionOutlinedIcon color="action" />;
};

const DocumentItem = ({
  item,
  disabled = false,
  onOpen,
  onReplace,
  onRetry,
  onRemove,
}: DocumentItemProps) => {
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const uploading = typeof item.progress === "number" && !item.error;
  const busy = disabled || uploading;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: item.error ? "error.light" : "divider",
        bgcolor: item.error ? "rgba(211, 47, 47, 0.04)" : "background.paper",
      }}
      data-document-item={item.kind}
    >
      <Box sx={{ pt: 0.25 }}>
        {item.error ? (
          <ErrorOutlineIcon color="error" />
        ) : (
          <FileIcon mimeType={item.mimeType} />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ maxWidth: "100%" }}
            title={item.filename}
          >
            {item.filename}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(item.sizeBytes)}
          </Typography>
          {item.kind === "stored" && !item.error && !uploading ? (
            <Chip
              label="Uploaded"
              size="small"
              color="success"
              variant="outlined"
            />
          ) : null}
        </Stack>

        {uploading ? (
          <Box sx={{ mt: 0.75 }}>
            <LinearProgress
              variant="determinate"
              value={Math.round((item.progress ?? 0) * 100)}
              aria-label={`Uploading ${item.filename}`}
            />
            <Typography variant="caption" color="text.secondary">
              {item.kind === "pending" ? "Uploading" : "Replacing"}…{" "}
              {Math.round((item.progress ?? 0) * 100)}%
            </Typography>
          </Box>
        ) : null}

        {item.error ? (
          <Typography variant="caption" color="error.main" display="block">
            {item.error}
          </Typography>
        ) : null}
      </Box>

      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
        {item.kind === "pending" && item.error && onRetry ? (
          <Tooltip title="Try again">
            <span>
              <IconButton
                size="small"
                onClick={onRetry}
                disabled={disabled}
                aria-label={`Retry ${item.filename}`}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}

        {item.kind === "stored" && onOpen ? (
          <Tooltip title="Open">
            <span>
              <IconButton
                size="small"
                onClick={onOpen}
                disabled={busy}
                aria-label={`Open ${item.filename}`}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}

        {item.kind === "stored" && onReplace ? (
          <>
            <input
              ref={replaceInputRef}
              type="file"
              accept={DOCUMENT_ACCEPT}
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onReplace(file);
                event.target.value = "";
              }}
            />
            <Tooltip title="Replace file">
              <span>
                <IconButton
                  size="small"
                  onClick={() => replaceInputRef.current?.click()}
                  disabled={busy}
                  aria-label={`Replace ${item.filename}`}
                >
                  <SwapHorizIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </>
        ) : null}

        <Tooltip title="Remove">
          <span>
            <IconButton
              size="small"
              onClick={onRemove}
              disabled={busy}
              aria-label={`Remove ${item.filename}`}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default DocumentItem;
