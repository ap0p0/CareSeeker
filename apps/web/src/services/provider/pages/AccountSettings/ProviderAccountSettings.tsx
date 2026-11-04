import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { ProviderPageShell } from "../../components";
import ProviderDocumentsStep from "../Register/steps/ProviderDocumentsStep";
import {
  ACCOUNT_SETTINGS_TABS,
  isAccountSettingsTab,
  type AccountSettingsTab,
} from "./settingsTabs";
import {
  AvailabilityEditor,
  PersonalInfoEditor,
  ServicesEditor,
} from "../../components/profile-editors";
import AccountCredentialsTab from "./tabs/AccountCredentialsTab";

/**
 * The single place where a provider edits what they submitted during
 * registration. Each tab reuses the matching onboarding form and saves that
 * section on its own — no need to run through the whole flow again.
 * The active tab lives in the URL (`?tab=`) so the overview can deep-link.
 */
const ProviderAccountSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const tab: AccountSettingsTab = isAccountSettingsTab(requested)
    ? requested
    : "personal";

  const selectTab = (next: AccountSettingsTab) => {
    setSearchParams({ tab: next }, { replace: true });
  };

  return (
    <ProviderPageShell
      title="Account settings"
      description="Update the information you shared with us. Changes are saved per section."
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_event, next: AccountSettingsTab) => selectTab(next)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Account settings sections"
          sx={{
            px: { xs: 1, md: 2 },
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          }}
        >
          {ACCOUNT_SETTINGS_TABS.map((item) => (
            <Tab
              key={item.key}
              value={item.key}
              label={item.label}
              id={`settings-tab-${item.key}`}
              aria-controls={`settings-panel-${item.key}`}
            />
          ))}
        </Tabs>

        <Box
          role="tabpanel"
          id={`settings-panel-${tab}`}
          aria-labelledby={`settings-tab-${tab}`}
          sx={{ p: { xs: 2, md: 3 } }}
        >
          {tab === "personal" ? <PersonalInfoEditor /> : null}
          {tab === "services" ? <ServicesEditor /> : null}
          {tab === "documents" ? <ProviderDocumentsStep /> : null}
          {tab === "availability" ? <AvailabilityEditor /> : null}
          {tab === "account" ? <AccountCredentialsTab /> : null}
        </Box>
      </Paper>
    </ProviderPageShell>
  );
};

export default ProviderAccountSettings;
