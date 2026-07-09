import { Box, CircularProgress } from "@mui/material";

export function ProviderAuthLoadingScreen() {
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
