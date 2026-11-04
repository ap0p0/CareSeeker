import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../../routes/enums";

export type AccountSettingsTab =
  | "personal"
  | "services"
  | "documents"
  | "availability"
  | "account";

export const ACCOUNT_SETTINGS_TABS: {
  key: AccountSettingsTab;
  label: string;
}[] = [
  { key: "personal", label: "Personal information" },
  { key: "services", label: "Services & job interests" },
  { key: "documents", label: "Documents" },
  { key: "availability", label: "Availability & preferences" },
  { key: "account", label: "Account" },
];

export const isAccountSettingsTab = (
  value: string | null,
): value is AccountSettingsTab =>
  ACCOUNT_SETTINGS_TABS.some((tab) => tab.key === value);

/** Deep link to one settings tab (used by the overview "Edit" buttons). */
export const accountSettingsPath = (tab: AccountSettingsTab): string =>
  `${PROVIDER_ROUTE_PATHS[ProviderRoute.AccountSettings]}?tab=${tab}`;
