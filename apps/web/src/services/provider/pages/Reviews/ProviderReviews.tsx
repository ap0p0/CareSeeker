import { Paper, Rating, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  ProviderEmptyState,
  ProviderPageShell,
  ProviderStatCard,
} from "../../components";

const ProviderReviews = () => {
  return (
    <ProviderPageShell
      title="Reviews"
      description="See ratings and written feedback from care seekers."
    >
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ProviderStatCard label="Overall rating" value="4.8" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ProviderStatCard label="Total reviews" value="32" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <ProviderStatCard label="5-star reviews" value="86%" />
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={1}>
            <Rating value={5} readOnly />
            <Typography fontWeight={600}>Excellent and dependable</Typography>
            <Typography color="text.secondary">
              Maria was professional, kind, and always on time. We would gladly
              book again.
            </Typography>
          </Stack>
        </Paper>

        <ProviderEmptyState
          title="More reviews coming soon"
          description="Additional written reviews will appear here as you complete more jobs."
        />
      </Stack>
    </ProviderPageShell>
  );
};

export default ProviderReviews;
