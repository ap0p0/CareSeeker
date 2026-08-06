import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Chip,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import {
  ProviderEmptyState,
  ProviderPageShell,
  ProviderSubNav,
} from "../../components";
import { fetchProviderCareRequests } from "../../data/mockProviderData";
import { useProviderPageQuery } from "../../hooks/useProviderPageQuery";
import { careRequestsSubNavItems } from "../../navigation/subNavItems";
import { providerCareRequestDetailsPath } from "../../../../routes/enums";

type CareRequestsListPageProps = {
  title: string;
  description: string;
  filter: "all" | "active" | "completed";
};

const CareRequestsListPage = ({
  title,
  description,
  filter,
}: CareRequestsListPageProps) => {
  const [search, setSearch] = useState("");
  const fetchRequests = useCallback(
    () => fetchProviderCareRequests(filter),
    [filter],
  );
  const { data, isLoading, error, reload } = useProviderPageQuery({
    fetcher: fetchRequests,
  });

  const filteredRequests = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();
    if (!query) return data;

    return data.filter(
      (request) =>
        request.seekerName.toLowerCase().includes(query) ||
        request.serviceType.toLowerCase().includes(query) ||
        request.location.toLowerCase().includes(query),
    );
  }, [data, search]);

  return (
    <ProviderPageShell
      title={title}
      description={description}
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
      <Stack spacing={2}>
        <TextField
          placeholder="Search by seeker, service, or location"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {filteredRequests.length === 0 ? (
          <ProviderEmptyState
            title="No care requests found"
            description="Try adjusting your search or check back later for new requests."
          />
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <List disablePadding>
              {filteredRequests.map((request) => (
                <ListItem key={request.id} disablePadding divider>
                  <ListItemButton
                    component={RouterLink}
                    to={providerCareRequestDetailsPath(request.id)}
                  >
                    <ListItemText
                      primary={request.seekerName}
                      secondary={`${request.serviceType} · ${request.location} · ${request.schedule}`}
                    />
                  </ListItemButton>
                  <Box pr={2}>
                    <Chip size="small" label={request.status} />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </ProviderPageShell>
  );
};

export default CareRequestsListPage;
