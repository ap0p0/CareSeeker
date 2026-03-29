import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Alert, Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useAdminDashboardQuery } from "../../../../queries/admin/useAdminDashboardQuery";
import DashboardRecentActivity from "./DashboardRecentActivity";
import DashboardStatCard from "./DashboardStatCard";
import { formatUsdFromCents } from "./utils";

const DashboardPage = () => {
  const { data, isLoading, isError } = useAdminDashboardQuery();

  if (isError) {
    return (
      <Alert severity="error" icon={<ErrorOutlineIcon />}>
        Could not load dashboard data. Try again later.
      </Alert>
    );
  }

  const summary = data?.summary;
  const recent = data?.recentActivity ?? [];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" component="h1" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          High-level platform snapshot. Figures are placeholders until live analytics are connected.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Total users"
            value={isLoading ? "…" : (summary?.totalUsers.toLocaleString() ?? "—")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Careseekers"
            value={isLoading ? "…" : (summary?.totalCareseekers.toLocaleString() ?? "—")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Care providers"
            value={isLoading ? "…" : (summary?.totalCareProviders.toLocaleString() ?? "—")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Open jobs"
            value={isLoading ? "…" : (summary?.openJobs.toLocaleString() ?? "—")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Payments total (mock)"
            value={
              isLoading ? "…" : summary ? formatUsdFromCents(summary.paymentsTotalCents) : "—"
            }
            subtitle="All-time volume placeholder"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Pending provider verifications"
            value={isLoading ? "…" : (summary?.pendingProviderVerifications.toLocaleString() ?? "—")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Active subscriptions"
            value={isLoading ? "…" : (summary?.activeSubscriptions.toLocaleString() ?? "—")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <DashboardStatCard
            title="Needs attention"
            value={isLoading ? "…" : (summary?.needsAttentionCount.toLocaleString() ?? "—")}
            subtitle="Queues requiring admin follow-up"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <DashboardRecentActivity items={recent} />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Alert severity="info" variant="outlined" sx={{ height: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick summary
            </Typography>
            <Typography variant="body2">
              This admin area is wired for mock data. Hook up each widget to your analytics and
              operational APIs when the backend is ready—query keys are already scoped per domain.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
