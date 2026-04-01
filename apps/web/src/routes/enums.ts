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
  ActiveJobs = "activeJobs",
  BrowseJobs = "browseJobs",
  PastJobs = "pastJobs",
  MyProfile = "myProfile",
  MyProfileTransactionsPayments = "myProfileTransactionsPayments",
  MyProfileTransactionsEarnings = "myProfileTransactionsEarnings",
  MyProfileEdit = "myProfileEdit",
}

export const PROVIDER_ROUTE_PATHS: Record<ProviderRoute, string> = {
  [ProviderRoute.Dashboard]: "/",
  [ProviderRoute.ActiveJobs]: "/active-jobs",
  [ProviderRoute.BrowseJobs]: "/browse-jobs",
  [ProviderRoute.PastJobs]: "/past-jobs",
  [ProviderRoute.MyProfile]: "/my-profile",
  [ProviderRoute.MyProfileTransactionsPayments]:
    "/my-profile/transactions/payments",
  [ProviderRoute.MyProfileTransactionsEarnings]:
    "/my-profile/transactions/earnings",
  [ProviderRoute.MyProfileEdit]: "/my-profile/edit",
};
