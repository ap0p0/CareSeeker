import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { AdminRoute, ADMIN_ROUTE_PATHS } from "./enums";
import AdminDashboard from "../services/admin/pages/AdminDashboard";
import AdminNotFound from "../services/admin/pages/NotFound";
import PlaceholderPage from "../components/PlaceholderPage";

export const adminRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<AdminDashboard />} />
      <Route
        path={ADMIN_ROUTE_PATHS[AdminRoute.Clients]}
        element={<PlaceholderPage title="Clients" />}
      />
      <Route
        path={ADMIN_ROUTE_PATHS[AdminRoute.Providers]}
        element={<PlaceholderPage title="Providers" />}
      />
      <Route
        path={ADMIN_ROUTE_PATHS[AdminRoute.Agencies]}
        element={<PlaceholderPage title="Agencies" />}
      />
      <Route
        path={ADMIN_ROUTE_PATHS[AdminRoute.Contracts]}
        element={<PlaceholderPage title="Contracts" />}
      />
      <Route
        path={ADMIN_ROUTE_PATHS[AdminRoute.Settings]}
        element={<PlaceholderPage title="Settings" />}
      />
      <Route path="*" element={<AdminNotFound />} />
    </>
  )
);
