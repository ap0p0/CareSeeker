import type { ReactNode } from "react";
import { Paper, Typography } from "@mui/material";
import {
  useProviderOverviewQuery,
  type ProviderOverview,
} from "../../../../queries/provider";
import { ProviderPageShell, ProviderSubNav } from "../../components";
import { profileSubNavItems } from "../../navigation/subNavItems";

type ProviderProfileSectionPageProps = {
  title: string;
  description: string;
  /** Renders the section from the provider's submitted data. */
  children?: (overview: ProviderOverview) => ReactNode;
};

/**
 * Read-only profile sections. Editing happens in account settings (each card
 * links to the right tab), so these pages only present what was submitted.
 */
const ProviderProfileSectionPage = ({
  title,
  description,
  children,
}: ProviderProfileSectionPageProps) => {
  const overviewQuery = useProviderOverviewQuery({
    enabled: Boolean(children),
  });
  const {
    data: queryData,
    isLoading: isLoadingQuery,
    isError: isErrorQuery,
  } = overviewQuery;

  return (
    <ProviderPageShell
      title={title}
      description={description}
      subNav={
        <ProviderSubNav
          items={profileSubNavItems}
          ariaLabel="Profile sections"
        />
      }
      isLoading={Boolean(children) && isLoadingQuery}
      error={
        children && isErrorQuery
          ? (overviewQuery.error?.message ?? "Could not load your profile.")
          : null
      }
      onRetry={() => void overviewQuery.refetch()}
    >
      {children && queryData ? (
        children(queryData)
      ) : !children ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography color="text.secondary">
            This section is ready for profile data entry and will connect to the
            provider API in a later phase.
          </Typography>
        </Paper>
      ) : null}
    </ProviderPageShell>
  );
};

export default ProviderProfileSectionPage;
