import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../routes/enums";
import type { ProviderSubNavItem } from "../components/ProviderSubNav";

export const profileSubNavItems: ProviderSubNavItem[] = [
  {
    label: "Personal information",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfilePersonalInformation],
  },
  {
    label: "Services offered",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileServicesOffered],
  },
  {
    label: "Experience",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileExperience],
  },
  {
    label: "Education & certifications",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileEducationCertifications],
  },
  {
    label: "Languages",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileLanguages],
  },
  {
    label: "Hourly rates",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileHourlyRates],
  },
  {
    label: "Photos",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfilePhotos],
  },
  {
    label: "Edit profile",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileEdit],
  },
];

export const availabilitySubNavItems: ProviderSubNavItem[] = [
  {
    label: "Summary",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.Availability],
    end: true,
  },
  {
    label: "Calendar",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.AvailabilityCalendar],
  },
  {
    label: "Time slots",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.AvailabilityTimeSlots],
  },
];

export const careRequestsSubNavItems: ProviderSubNavItem[] = [
  {
    label: "All requests",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequests],
    end: true,
  },
  {
    label: "Active jobs",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequestsActive],
  },
  {
    label: "Completed jobs",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequestsCompleted],
  },
];

export const earningsSubNavItems: ProviderSubNavItem[] = [
  {
    label: "Overview",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.Earnings],
    end: true,
  },
  {
    label: "Payout history",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.EarningsPayouts],
  },
  {
    label: "Tax documents",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.EarningsTaxDocuments],
  },
  {
    label: "Reports",
    to: PROVIDER_ROUTE_PATHS[ProviderRoute.EarningsReports],
  },
];
