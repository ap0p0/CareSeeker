import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

type ProviderEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const ProviderEmptyState = ({
  title,
  description = "Nothing to show yet.",
  action,
}: ProviderEmptyStateProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "center",
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
        <InboxOutlinedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <Typography color="text.secondary" maxWidth={420}>
          {description}
        </Typography>
        {action}
      </Box>
    </Paper>
  );
};

export default ProviderEmptyState;
