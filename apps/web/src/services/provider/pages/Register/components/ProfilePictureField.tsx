import { useEffect, useMemo, useRef } from "react";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Stack,
  Typography,
} from "@mui/material";
import {
  PROFILE_PICTURE_ACCEPT,
  PROFILE_PICTURE_MAX_BYTES,
} from "../validation";

type ProfilePictureFieldProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /** Already stored picture, shown until a new file is chosen. */
  currentImageUrl?: string | null;
};

const formatFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Image picker with live avatar preview. Validation messages come from the
 * parent (`error`) so the field stays in sync with the rest of the form.
 */
const ProfilePictureField = ({
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  currentImageUrl = null,
}: ProfilePictureFieldProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openPicker = () => inputRef.current?.click();

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
  };

  return (
    <FormControl
      component="fieldset"
      fullWidth
      error={Boolean(error)}
      disabled={disabled}
      required={required}
    >
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Profile picture
      </FormLabel>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Avatar
          src={previewUrl ?? currentImageUrl ?? undefined}
          alt={value || currentImageUrl ? "Profile picture preview" : ""}
          sx={{
            width: 96,
            height: 96,
            bgcolor: "grey.100",
            color: "text.secondary",
            border: "1px solid",
            borderColor: error ? "error.main" : "divider",
          }}
        >
          <PersonIcon sx={{ fontSize: 48 }} />
        </Avatar>

        <Box>
          <input
            ref={inputRef}
            type="file"
            accept={PROFILE_PICTURE_ACCEPT}
            hidden
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              onChange(file);
            }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              type="button"
              variant="outlined"
              startIcon={<AddAPhotoIcon />}
              onClick={openPicker}
              disabled={disabled}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
            >
              {value || currentImageUrl ? "Change photo" : "Upload photo"}
            </Button>
            {value ? (
              <Button
                type="button"
                variant="text"
                color="inherit"
                onClick={handleRemove}
                disabled={disabled}
                sx={{ borderRadius: 999, textTransform: "none" }}
              >
                Remove
              </Button>
            ) : null}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 0.75 }}
          >
            {value
              ? `${value.name} · ${formatFileSize(value.size)}`
              : currentImageUrl
                ? "Current picture. Choose a new file to replace it."
                : `JPEG, PNG or WebP, up to ${PROFILE_PICTURE_MAX_BYTES / (1024 * 1024)} MB.`}
          </Typography>
        </Box>
      </Stack>

      {error ? <FormHelperText>{error}</FormHelperText> : null}
    </FormControl>
  );
};

export default ProfilePictureField;
