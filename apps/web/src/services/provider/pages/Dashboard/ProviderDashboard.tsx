import { useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Link as RouterLink } from "react-router-dom";
import {
  PROVIDER_ROUTE_PATHS,
  ProviderRoute,
  providerCareRequestDetailsPath,
} from "../../../../routes/enums";
import {
  ProviderEmptyState,
  ProviderPageShell,
  ProviderStatCard,
} from "../../components";
import { fetchProviderDashboardData } from "../../data/mockProviderData";
import { useProviderPageQuery } from "../../hooks/useProviderPageQuery";

const ProviderDashboard = () => {
  const fetchDashboard = useCallback(() => fetchProviderDashboardData(), []);
  const { data, isLoading, error, reload } = useProviderPageQuery({
    fetcher: fetchDashboard,
  });

  return (
    <ProviderPageShell
      title="Dashboard"
      description="Your home base for requests, profile progress, and availability."
      isLoading={isLoading}
      error={error}
      onRetry={reload}
    >
      {data ? (
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProviderStatCard
                label="Active requests"
                value={data.stats.activeRequests}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProviderStatCard
                label="Completed jobs"
                value={data.stats.completedJobs}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProviderStatCard
                label="Profile completion"
                value={`${data.stats.profileCompletion}%`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <ProviderStatCard
                label="Weekly hours"
                value={`${data.stats.weeklyHours}h`}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent care requests
                </Typography>
                {data.recentRequests.length === 0 ? (
                  <ProviderEmptyState
                    title="No recent requests"
                    description="New care requests will appear here."
                  />
                ) : (
                  <List disablePadding>
                    {data.recentRequests.map((request) => (
                      <ListItem
                        key={request.id}
                        disableGutters
                        secondaryAction={
                          <Chip
                            size="small"
                            label={request.status}
                            color={
                              request.status === "pending" ? "warning" : "success"
                            }
                          />
                        }
                      >
                        <ListItemText
                          primary={request.seekerName}
                          secondary={`${request.serviceType} · ${request.requestedAt}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                <Box mt={2}>
                  <Button
                    component={RouterLink}
                    to={PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequests]}
                    variant="outlined"
                  >
                    View all requests
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2} height="100%">
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Profile completion
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={data.stats.profileCompletion}
                    sx={{ height: 10, borderRadius: 999, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {data.stats.profileCompletion}% complete
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={
                      PROVIDER_ROUTE_PATHS[ProviderRoute.ProfilePersonalInformation]
                    }
                    size="small"
                    sx={{ mt: 1.5 }}
                  >
                    Complete profile
                  </Button>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Verification status
                  </Typography>
                  <Alert
                    severity={
                      data.verificationStatus === "approved"
                        ? "success"
                        : data.verificationStatus === "rejected"
                          ? "error"
                          : "info"
                    }
                  >
                    {data.verificationStatus === "approved"
                      ? "Your account is verified."
                      : data.verificationStatus === "rejected"
                        ? "Verification was rejected. Please resubmit documents."
                        : "Verification is pending review."}
                  </Alert>
                  <Button
                    component={RouterLink}
                    to={PROVIDER_ROUTE_PATHS[ProviderRoute.Verification]}
                    size="small"
                    sx={{ mt: 1.5 }}
                  >
                    Manage verification
                  </Button>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Availability summary
                  </Typography>
                  <Typography color="text.secondary">
                    {data.availabilitySummary}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={PROVIDER_ROUTE_PATHS[ProviderRoute.Availability]}
                    size="small"
                    sx={{ mt: 1.5 }}
                  >
                    Update availability
                  </Button>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          {data.recentRequests[0] ? (
            <Box>
              <Button
                component={RouterLink}
                to={providerCareRequestDetailsPath(data.recentRequests[0].id)}
                variant="text"
              >
                Open latest request details
              </Button>
            </Box>
          ) : null}
        </Stack>
      ) : null}
    </ProviderPageShell>
  );
};

export default ProviderDashboard;
