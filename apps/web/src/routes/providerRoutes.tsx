import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { ProviderRoute, PROVIDER_ROUTE_PATHS } from "./enums";
import ProviderDashboard from "../services/provider/pages/ProviderDashboard";
import ProviderNotFound from "../services/provider/pages/NotFound";
import PlaceholderPage from "../components/PlaceholderPage";

export const providerRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<ProviderDashboard />} />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.ActiveJobs]}
        element={<PlaceholderPage title="Active Jobs" />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.BrowseJobs]}
        element={<PlaceholderPage title="Browse Jobs" />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.PastJobs]}
        element={<PlaceholderPage title="Past Jobs" />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.MyProfile]}
        element={<PlaceholderPage title="My Profile" />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.MyProfileTransactionsPayments]}
        element={<PlaceholderPage title="Payments" />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.MyProfileTransactionsEarnings]}
        element={<PlaceholderPage title="Earnings" />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.MyProfileEdit]}
        element={<PlaceholderPage title="Edit Profile" />}
      />
      <Route path="*" element={<ProviderNotFound />} />
    </>
  )
);
