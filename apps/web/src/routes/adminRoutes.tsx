import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
import { ADMIN_ROUTE_PATHS, AdminRoute } from "./enums";
import { RequireAdmin } from "../services/admin/auth";
import AdminLayout from "../services/admin/layout/AdminLayout";
import AdminLoginPage from "../services/admin/pages/AdminLogin";
import AdminNotFound from "../services/admin/pages/NotFound";
import DashboardPage from "../services/admin/pages/Dashboard";
import CareseekerOverviewPage from "../services/admin/pages/CareseekerOverview";
import CareProviderOverviewPage from "../services/admin/pages/CareProviderOverview";
import OpenJobsOverviewPage from "../services/admin/pages/OpenJobsOverview";
import PaymentsHistoryPage from "../services/admin/pages/PaymentsHistory";
import ReportsPage from "../services/admin/pages/Reports";

export const adminRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="login" element={<AdminLoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route
            index
            element={
              <Navigate
                to={ADMIN_ROUTE_PATHS[AdminRoute.Dashboard]}
                replace
              />
            }
          />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="careseekers" element={<CareseekerOverviewPage />} />
          <Route path="care-providers" element={<CareProviderOverviewPage />} />
          <Route path="open-jobs" element={<OpenJobsOverviewPage />} />
          <Route
            path="jobs"
            element={
              <Navigate
                to={ADMIN_ROUTE_PATHS[AdminRoute.OpenJobs]}
                replace
              />
            }
          />
          <Route path="payments-history" element={<PaymentsHistoryPage />} />
          <Route
            path="payments"
            element={
              <Navigate
                to={ADMIN_ROUTE_PATHS[AdminRoute.PaymentsHistory]}
                replace
              />
            }
          />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Route>
    </>
  )
);
