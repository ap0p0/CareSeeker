import { Paper, Typography } from "@mui/material";
import { ProviderPageShell, ProviderSubNav } from "../../components";
import { profileSubNavItems } from "../../navigation/subNavItems";

type ProviderProfileSectionPageProps = {
  title: string;
  description: string;
};

const ProviderProfileSectionPage = ({
  title,
  description,
}: ProviderProfileSectionPageProps) => {
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
          This section is ready for profile data entry and will connect to the
          provider API in a later phase.
        </Typography>
      </Paper>
    </ProviderPageShell>
  );
};

export default ProviderProfileSectionPage;
