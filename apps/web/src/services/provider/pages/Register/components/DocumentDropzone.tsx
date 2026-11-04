import type { DragEvent } from "react";
import { useId, useRef, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { Box, Typography } from "@mui/material";
import { DOCUMENT_ACCEPT } from "../documentOptions";

type DocumentDropzoneProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  label?: string;
};

/**
 * Drag & drop area that also opens the native picker on click / Enter.
 * Only hands files to the parent; validation and uploading happen there.
 */
const DocumentDropzone = ({
  onFiles,
  disabled = false,
  multiple = true,
  label = "Drag & drop files here, or click to browse",
}: DocumentDropzoneProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const emit = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    emit(event.dataTransfer.files);
  };

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={label}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 2,
        borderRadius: 3,
        border: "2px dashed",
        borderColor: dragging ? "primary.main" : "divider",
        bgcolor: dragging ? "action.hover" : "background.paper",
        color: disabled ? "text.disabled" : "text.secondary",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: { xs: "center", sm: "left" },
        transition: "border-color 120ms, background-color 120ms",
        "&:hover": disabled ? undefined : { borderColor: "primary.main" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={DOCUMENT_ACCEPT}
        multiple={multiple}
        hidden
        disabled={disabled}
        onChange={(event) => {
          emit(event.target.files);
          // Allow re-selecting the same file after a remove / failure.
          event.target.value = "";
        }}
      />
      <CloudUploadOutlinedIcon color={dragging ? "primary" : "inherit"} />
      <Box>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {label}
        </Typography>
        <Typography variant="caption">
          PDF, DOC, DOCX, JPG or PNG · up to 15 MB each
        </Typography>
      </Box>
    </Box>
  );
};

export default DocumentDropzone;
