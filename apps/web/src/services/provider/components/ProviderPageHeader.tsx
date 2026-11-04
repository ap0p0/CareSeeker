import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

type ProviderPageHeaderProps = {
  title: string;
  description?: string;
  /** Optional leading element, e.g. the provider's avatar. */
  adornment?: ReactNode;
};

const ProviderPageHeader = ({
  title,
  description,
  adornment,
}: ProviderPageHeaderProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {adornment ?? null}
        <Box display="flex" flexDirection="column" gap={1} sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
          {description ? (
            <Typography color="text.secondary">{description}</Typography>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProviderPageHeader;
