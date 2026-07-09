import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from "react-router-dom";
import { SeekerRoute, SEEKER_ROUTE_PATHS } from "./enums";
import { RequireClient } from "../services/client/auth";
import ClientDashboard from "../services/client/pages/ClientDashboard";
import ClientLayout from "../services/client/layout/ClientLayout";
import ClientLoginPage from "../services/client/pages/Login/ClientLogin";
import ClientNotFound from "../services/client/pages/NotFound";
import ClientRegisterPage from "../services/client/pages/Register/ClientRegister";
import ClientSectionPage from "../services/client/pages/ClientSectionPage";

export const clientRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.Login]}
        element={<ClientLoginPage />}
      />
      <Route
        path={SEEKER_ROUTE_PATHS[SeekerRoute.Register]}
        element={<ClientRegisterPage />}
      />
      <Route element={<RequireClient />}>
        <Route element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.Overview]}
            element={<ClientDashboard />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.Jobs]}
            element={<ClientSectionPage title="Open Jobs" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.NewJob]}
            element={<ClientSectionPage title="Add New Job" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.History]}
            element={<ClientSectionPage title="History" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.SavedProviders]}
            element={<ClientSectionPage title="Saved Providers" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.Explore]}
            element={<ClientSectionPage title="Explore" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.Notifications]}
            element={<ClientSectionPage title="Notifications" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.Messages]}
            element={<ClientSectionPage title="Messaging" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.ReviewsRatings]}
            element={<ClientSectionPage title="Reviews & Ratings" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.SubscriptionsPayments]}
            element={<ClientSectionPage title="Subscription & Payments" />}
          />
          <Route
            path={SEEKER_ROUTE_PATHS[SeekerRoute.MyAccount]}
            element={<ClientSectionPage title="My Account" />}
          />
          <Route path="*" element={<ClientNotFound />} />
        </Route>
      </Route>
      <Route
        path="dashboard"
        element={
          <Navigate
            to={SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard]}
            replace
          />
        }
      />
      <Route path="*" element={<ClientNotFound />} />
    </>
  )
);
