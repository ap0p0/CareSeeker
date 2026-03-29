import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import AdminLayout from "../services/admin/layout/AdminLayout";
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
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="careseekers" element={<CareseekerOverviewPage />} />
        <Route path="care-providers" element={<CareProviderOverviewPage />} />
        <Route path="open-jobs" element={<OpenJobsOverviewPage />} />
        <Route path="payments-history" element={<PaymentsHistoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<AdminNotFound />} />
    </>
  )
);
