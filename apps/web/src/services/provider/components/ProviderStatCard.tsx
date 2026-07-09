import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type ProviderStatCardProps = {
  label: string;
  value: ReactNode;
  helperText?: string;
};

const ProviderStatCard = ({ label, value, helperText }: ProviderStatCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
      }}
    >
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
      {helperText ? (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
};

export default ProviderStatCard;
