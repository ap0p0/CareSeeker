/**
 * Route enums for Careseeker application
 * Organized by: base app, admin, care seeker, care provider
 */

// ─── Base App Routes (careseeker.com/...) ────────────────────────────────────

export enum BaseRoute {
  Home = "home",
  AboutUs = "aboutUs",
  GetCare = "getCare",
  GiveCare = "giveCare",
  Pricing = "pricing",
  Login = "login",
  Register = "register",
}

export const BASE_ROUTE_PATHS: Record<BaseRoute, string> = {
  [BaseRoute.Home]: "/",
  [BaseRoute.AboutUs]: "/about",
  [BaseRoute.GetCare]: "/get-care",
  [BaseRoute.GiveCare]: "/give-care",
  [BaseRoute.Pricing]: "/pricing",
  [BaseRoute.Login]: "/login",
  [BaseRoute.Register]: "/register",
};

// ─── Admin Routes (admin.careseeker.com/...) ─────────────────────────────────

export enum AdminRoute {
  Dashboard = "dashboard",
  Careseekers = "careseekers",
  CareProviders = "careProviders",
  OpenJobs = "openJobs",
  PaymentsHistory = "paymentsHistory",
  Reports = "reports",
}

export const ADMIN_ROUTE_PATHS: Record<AdminRoute, string> = {
  [AdminRoute.Dashboard]: "/dashboard",
  [AdminRoute.Careseekers]: "/careseekers",
  [AdminRoute.CareProviders]: "/care-providers",
  [AdminRoute.OpenJobs]: "/open-jobs",
  [AdminRoute.PaymentsHistory]: "/payments-history",
  [AdminRoute.Reports]: "/reports",
};

// ─── Care Seeker Routes (client.careseeker.com/...) ──────────────────────────

export enum SeekerRoute {
  Dashboard = "dashboard",
  Overview = "overview",
  Login = "login",
  Register = "register",
  Jobs = "jobs",
  NewJob = "newJob",
  History = "history",
  SavedProviders = "savedProviders",
  Explore = "explore",
  Notifications = "notifications",
  MyAccount = "myAccount",
  ReviewsRatings = "reviewsRatings",
  Messages = "messages",
  SubscriptionsPayments = "subscriptionsPayments",
}

export const SEEKER_ROUTE_PATHS: Record<SeekerRoute, string> = {
  [SeekerRoute.Dashboard]: "/",
  [SeekerRoute.Overview]: "/overview",
  [SeekerRoute.Login]: "/login",
  [SeekerRoute.Register]: "/register",
  [SeekerRoute.Jobs]: "/jobs",
  [SeekerRoute.NewJob]: "/jobs/new",
  [SeekerRoute.History]: "/history",
  [SeekerRoute.SavedProviders]: "/saved",
  [SeekerRoute.Explore]: "/explore",
  [SeekerRoute.Notifications]: "/notifications",
  [SeekerRoute.MyAccount]: "/me",
  [SeekerRoute.ReviewsRatings]: "/reviews-ratings",
  [SeekerRoute.Messages]: "/messages",
  [SeekerRoute.SubscriptionsPayments]: "/subscriptions-payments",
};

// ─── Care Provider Routes (provider.careseeker.com/...) ──────────────────────

export enum ProviderRoute {
  Dashboard = "dashboard",
  Login = "login",
  Register = "register",
  ProfilePersonalInformation = "profilePersonalInformation",
  ProfileServicesOffered = "profileServicesOffered",
  ProfileExperience = "profileExperience",
  ProfileEducationCertifications = "profileEducationCertifications",
  ProfileLanguages = "profileLanguages",
  ProfileHourlyRates = "profileHourlyRates",
  ProfilePhotos = "profilePhotos",
  ProfileEdit = "profileEdit",
  Availability = "availability",
  AvailabilityCalendar = "availabilityCalendar",
  AvailabilityTimeSlots = "availabilityTimeSlots",
  CareRequests = "careRequests",
  CareRequestsActive = "careRequestsActive",
  CareRequestsCompleted = "careRequestsCompleted",
  Reviews = "reviews",
  Notifications = "notifications",
  Verification = "verification",
  AccountSettings = "accountSettings",
  Earnings = "earnings",
  EarningsPayouts = "earningsPayouts",
  EarningsTaxDocuments = "earningsTaxDocuments",
  EarningsReports = "earningsReports",
}

export const PROVIDER_ROUTE_PATHS: Record<ProviderRoute, string> = {
  [ProviderRoute.Dashboard]: "/",
  [ProviderRoute.Login]: "/login",
  [ProviderRoute.Register]: "/register",
  [ProviderRoute.ProfilePersonalInformation]: "/profile/personal-information",
  [ProviderRoute.ProfileServicesOffered]: "/profile/services-offered",
  [ProviderRoute.ProfileExperience]: "/profile/experience",
  [ProviderRoute.ProfileEducationCertifications]:
    "/profile/education-certifications",
  [ProviderRoute.ProfileLanguages]: "/profile/languages",
  [ProviderRoute.ProfileHourlyRates]: "/profile/hourly-rates",
  [ProviderRoute.ProfilePhotos]: "/profile/photos",
  [ProviderRoute.ProfileEdit]: "/profile/edit",
  [ProviderRoute.Availability]: "/availability",
  [ProviderRoute.AvailabilityCalendar]: "/availability/calendar",
  [ProviderRoute.AvailabilityTimeSlots]: "/availability/time-slots",
  [ProviderRoute.CareRequests]: "/care-requests",
  [ProviderRoute.CareRequestsActive]: "/care-requests/active",
  [ProviderRoute.CareRequestsCompleted]: "/care-requests/completed",
  [ProviderRoute.Reviews]: "/reviews",
  [ProviderRoute.Notifications]: "/notifications",
  [ProviderRoute.Verification]: "/verification",
  [ProviderRoute.AccountSettings]: "/account-settings",
  [ProviderRoute.Earnings]: "/earnings",
  [ProviderRoute.EarningsPayouts]: "/earnings/payouts",
  [ProviderRoute.EarningsTaxDocuments]: "/earnings/tax-documents",
  [ProviderRoute.EarningsReports]: "/earnings/reports",
};

export const providerCareRequestDetailsPath = (requestId: string) =>
  `/care-requests/${requestId}`;
