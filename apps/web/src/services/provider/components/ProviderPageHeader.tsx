import { Box, Paper, Typography } from "@mui/material";

type ProviderPageHeaderProps = {
  title: string;
  description?: string;
};

const ProviderPageHeader = ({
  title,
  description,
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
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary">{description}</Typography>
        ) : null}
      </Box>
    </Paper>
  );
};

export default ProviderPageHeader;
