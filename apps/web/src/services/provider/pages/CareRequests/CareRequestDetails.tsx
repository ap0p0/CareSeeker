import { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";
import {
  ProviderEmptyState,
  ProviderPageShell,
  ProviderSubNav,
} from "../../components";
import { fetchProviderCareRequestById } from "../../data/mockProviderData";
import { useProviderPageQuery } from "../../hooks/useProviderPageQuery";
import { careRequestsSubNavItems } from "../../navigation/subNavItems";

const CareRequestDetails = () => {
  const { requestId = "" } = useParams();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const fetchRequest = useCallback(
    () => fetchProviderCareRequestById(requestId),
    [requestId]
  );
  const { data, isLoading, error, reload } = useProviderPageQuery({
    fetcher: fetchRequest,
  });

  const handleAction = (action: "accept" | "reject") => {
    setActionMessage(
      action === "accept"
        ? "Request accepted. This will be saved when the API is connected."
        : "Request rejected. This will be saved when the API is connected."
    );
  };

  return (
    <ProviderPageShell
      title="Request details"
      description="Review request information and respond with accept or reject."
      subNav={
        <ProviderSubNav
          items={careRequestsSubNavItems}
          ariaLabel="Care request sections"
        />
      }
      isLoading={isLoading}
      error={error}
      onRetry={reload}
    >
      {!data && !isLoading && !error ? (
        <ProviderEmptyState
          title="Request not found"
          description="This care request may have been removed or is no longer available."
          action={
            <Button
              component={RouterLink}
              to={PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequests]}
              variant="contained"
            >
              Back to requests
            </Button>
          }
        />
      ) : null}

      {data ? (
        <Stack spacing={2}>
          {actionMessage ? <Alert severity="info">{actionMessage}</Alert> : null}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Typography variant="h5" fontWeight={700}>
                  {data.seekerName}
                </Typography>
                <Chip label={data.status} />
              </Box>
              <Typography color="text.secondary">{data.serviceType}</Typography>
              <Typography variant="body2">Location: {data.location}</Typography>
              <Typography variant="body2">Schedule: {data.schedule}</Typography>
              <Typography variant="body2">Notes: {data.notes}</Typography>
            </Stack>
          </Paper>

          {data.status === "pending" ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button variant="contained" onClick={() => handleAction("accept")}>
                Accept request
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleAction("reject")}
              >
                Reject request
              </Button>
            </Stack>
          ) : null}

          <Button
            component={RouterLink}
            to={PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequests]}
          >
            Back to all requests
          </Button>
        </Stack>
      ) : null}
    </ProviderPageShell>
  );
};

export default CareRequestDetails;
