import { Paper, Typography } from "@mui/material";
import { ProviderPageShell, ProviderSubNav } from "../../components";
import { availabilitySubNavItems } from "../../navigation/subNavItems";

type ProviderAvailabilitySectionPageProps = {
  title: string;
  description: string;
};

const ProviderAvailabilitySectionPage = ({
  title,
  description,
}: ProviderAvailabilitySectionPageProps) => {
  return (
    <ProviderPageShell
      title={title}
      description={description}
      subNav={
        <ProviderSubNav
          items={availabilitySubNavItems}
          ariaLabel="Availability sections"
        />
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
          Availability management UI will be connected here, including calendar
          views, time slot editing, and summary statistics.
        </Typography>
      </Paper>
    </ProviderPageShell>
  );
};

export default ProviderAvailabilitySectionPage;
