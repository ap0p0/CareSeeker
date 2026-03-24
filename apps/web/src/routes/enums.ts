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
  Login = "login",
  Register = "register",
}

export const BASE_ROUTE_PATHS: Record<BaseRoute, string> = {
  [BaseRoute.Home]: "/",
  [BaseRoute.AboutUs]: "/about",
  [BaseRoute.GetCare]: "/get-care",
  [BaseRoute.GiveCare]: "/give-care",
  [BaseRoute.Login]: "/login",
  [BaseRoute.Register]: "/register",
};

// ─── Admin Routes (admin.careseeker.com/...) ─────────────────────────────────

export enum AdminRoute {
  Dashboard = "dashboard",
  Clients = "clients",
  Providers = "providers",
  Agencies = "agencies",
  Contracts = "contracts",
  Settings = "settings",
}

export const ADMIN_ROUTE_PATHS: Record<AdminRoute, string> = {
  [AdminRoute.Dashboard]: "/",
  [AdminRoute.Clients]: "/clients",
  [AdminRoute.Providers]: "/providers",
  [AdminRoute.Agencies]: "/agencies",
  [AdminRoute.Contracts]: "/contracts",
  [AdminRoute.Settings]: "/settings",
};

// ─── Care Seeker Routes (client.careseeker.com/...) ──────────────────────────

export enum SeekerRoute {
  Dashboard = "dashboard",
  ActiveJobs = "activeJobs",
  CreateNewJob = "createNewJob",
  FindProviders = "findProviders",
  PastJobs = "pastJobs",
  MyProfile = "myProfile",
  MyProfilePaymentInfo = "myProfilePaymentInfo",
  MyProfileTransactions = "myProfileTransactions",
  MyProfileEdit = "myProfileEdit",
}

export const SEEKER_ROUTE_PATHS: Record<SeekerRoute, string> = {
  [SeekerRoute.Dashboard]: "/",
  [SeekerRoute.ActiveJobs]: "/active-jobs",
  [SeekerRoute.CreateNewJob]: "/create-job",
  [SeekerRoute.FindProviders]: "/find-providers",
  [SeekerRoute.PastJobs]: "/past-jobs",
  [SeekerRoute.MyProfile]: "/my-profile",
  [SeekerRoute.MyProfilePaymentInfo]: "/my-profile/payment-info",
  [SeekerRoute.MyProfileTransactions]: "/my-profile/transactions",
  [SeekerRoute.MyProfileEdit]: "/my-profile/edit",
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
