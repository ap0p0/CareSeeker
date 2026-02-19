import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { SeekerRoute, SEEKER_ROUTE_PATHS } from "./enums";
import ClientDashboard from "../services/client/pages/ClientDashboard";
import ClientNotFound from "../services/client/pages/NotFound";
import PlaceholderPage from "../components/PlaceholderPage";

export const clientRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<ClientDashboard />} />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.ActiveJobs]}
        element={<PlaceholderPage title="Active Jobs" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.CreateNewJob]}
        element={<PlaceholderPage title="Create New Job" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.FindProviders]}
        element={<PlaceholderPage title="Browse Care Providers" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.PastJobs]}
        element={<PlaceholderPage title="Past Jobs" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.MyProfile]}
        element={<PlaceholderPage title="My Profile" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.MyProfilePaymentInfo]}
        element={<PlaceholderPage title="Payment Info" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.MyProfileTransactions]}
        element={<PlaceholderPage title="Transactions" />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.MyProfileEdit]}
        element={<PlaceholderPage title="Edit Profile" />}
      />
      <Route path="*" element={<ClientNotFound />} />
    </>
  )
);
