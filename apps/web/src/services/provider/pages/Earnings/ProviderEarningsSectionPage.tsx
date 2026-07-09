import { Paper, Typography } from "@mui/material";
import { ProviderPageShell, ProviderSubNav } from "../../components";
import { earningsSubNavItems } from "../../navigation/subNavItems";

type ProviderEarningsSectionPageProps = {
  title: string;
  description: string;
};

const ProviderEarningsSectionPage = ({
  title,
  description,
}: ProviderEarningsSectionPageProps) => {
  return (
    <ProviderPageShell
      title={title}
      description={description}
      subNav={
        <ProviderSubNav items={earningsSubNavItems} ariaLabel="Earnings sections" />
      }
    >
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
          Phase 2 earnings features will include payout history, tax documents,
          and detailed earnings reports.
        </Typography>
      </Paper>
    </ProviderPageShell>
  );
};

export default ProviderEarningsSectionPage;
