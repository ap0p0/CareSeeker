import { Box, Paper, Typography } from "@mui/material";

type ClientPageHeaderProps = {
  title: string;
  description?: string;
};

const ClientPageHeader = ({
  title,
  description = `${title} - coming soon`,
}: ClientPageHeaderProps) => {
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
        <Typography color="text.secondary">{description}</Typography>
      </Box>
    </Paper>
  );
};

export default ClientPageHeader;
