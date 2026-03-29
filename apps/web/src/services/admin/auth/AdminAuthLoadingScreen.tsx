import { Box, CircularProgress } from "@mui/material";

/**
 * Full-screen spinner used while admin auth is resolving (session + GET /admin/me).
 * Keeps protected UI from flashing before validation completes.
 */
export function AdminAuthLoadingScreen() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      role="status"
      aria-busy="true"
    >
      <CircularProgress aria-label="Loading" />
    </Box>
  );
}
