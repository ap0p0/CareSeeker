import { Box, CircularProgress } from "@mui/material";

const ProviderLoadingState = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={240}
      role="status"
      aria-busy="true"
    >
      <CircularProgress aria-label="Loading" />
    </Box>
  );
};

export default ProviderLoadingState;
