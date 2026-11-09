import { Alert, Button, CircularProgress, Stack } from "@mui/material";

/** Loading / error states shared by the inline editors of the review page. */

export const EditorLoading = () => (
  <Stack alignItems="center" py={6}>
    <CircularProgress size={28} />
  </Stack>
);

export const EditorLoadError = ({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) => (
  <Stack spacing={2}>
    <Alert severity="error">{message}</Alert>
    <Button
      variant="contained"
      onClick={onRetry}
      disabled={retrying}
      sx={{ alignSelf: "flex-start", borderRadius: 999, textTransform: "none" }}
    >
      Try again
    </Button>
  </Stack>
);

export const saveErrorMessage = (caught: unknown): string =>
  caught instanceof Error
    ? caught.message
    : "Could not save your changes. Please try again.";
