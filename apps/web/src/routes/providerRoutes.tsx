import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { ProviderRoute, PROVIDER_ROUTE_PATHS } from "./enums";
import { RequireProvider } from "../services/provider/auth";
import ProviderLayout from "../services/provider/layout/ProviderLayout";
import ProviderLoginPage from "../services/provider/pages/Login/ProviderLogin";
import ProviderRegisterPage from "../services/provider/pages/Register/ProviderRegister";
import ProviderNotFound from "../services/provider/pages/NotFound";
import ProviderDashboard from "../services/provider/pages/Dashboard/ProviderDashboard";
import ProfilePersonalInformation from "../services/provider/pages/Profile/ProfilePersonalInformation";
import ProfileServicesOffered from "../services/provider/pages/Profile/ProfileServicesOffered";
import ProfileExperience from "../services/provider/pages/Profile/ProfileExperience";
import ProfileEducationCertifications from "../services/provider/pages/Profile/ProfileEducationCertifications";
import ProfileLanguages from "../services/provider/pages/Profile/ProfileLanguages";
import ProfileHourlyRates from "../services/provider/pages/Profile/ProfileHourlyRates";
import ProfilePhotos from "../services/provider/pages/Profile/ProfilePhotos";
import ProfileEdit from "../services/provider/pages/Profile/ProfileEdit";
import AvailabilitySummary from "../services/provider/pages/Availability/AvailabilitySummary";
import AvailabilityCalendar from "../services/provider/pages/Availability/AvailabilityCalendar";
import AvailabilityTimeSlots from "../services/provider/pages/Availability/AvailabilityTimeSlots";
import CareRequestsAll from "../services/provider/pages/CareRequests/CareRequestsAll";
import CareRequestsActive from "../services/provider/pages/CareRequests/CareRequestsActive";
import CareRequestsCompleted from "../services/provider/pages/CareRequests/CareRequestsCompleted";
import CareRequestDetails from "../services/provider/pages/CareRequests/CareRequestDetails";
import ProviderReviews from "../services/provider/pages/Reviews/ProviderReviews";
import ProviderNotifications from "../services/provider/pages/Notifications/ProviderNotifications";
import ProviderVerification from "../services/provider/pages/Verification/ProviderVerification";
import ProviderAccountSettings from "../services/provider/pages/AccountSettings/ProviderAccountSettings";
import EarningsOverview from "../services/provider/pages/Earnings/EarningsOverview";
import EarningsPayouts from "../services/provider/pages/Earnings/EarningsPayouts";
import EarningsTaxDocuments from "../services/provider/pages/Earnings/EarningsTaxDocuments";
import EarningsReports from "../services/provider/pages/Earnings/EarningsReports";

export const providerRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.Login]}
        element={<ProviderLoginPage />}
      />
      <Route
        path={PROVIDER_ROUTE_PATHS[ProviderRoute.Register]}
        element={<ProviderRegisterPage />}
      />
      <Route element={<RequireProvider />}>
        <Route element={<ProviderLayout />}>
          <Route index element={<ProviderDashboard />} />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfilePersonalInformation]}
          element={<ProfilePersonalInformation />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileServicesOffered]}
          element={<ProfileServicesOffered />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileExperience]}
          element={<ProfileExperience />}
        />
        <Route
          path={
            PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileEducationCertifications]
          }
          element={<ProfileEducationCertifications />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileLanguages]}
          element={<ProfileLanguages />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileHourlyRates]}
          element={<ProfileHourlyRates />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfilePhotos]}
          element={<ProfilePhotos />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.ProfileEdit]}
          element={<ProfileEdit />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.Availability]}
          element={<AvailabilitySummary />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.AvailabilityCalendar]}
          element={<AvailabilityCalendar />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.AvailabilityTimeSlots]}
          element={<AvailabilityTimeSlots />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequests]}
          element={<CareRequestsAll />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequestsActive]}
          element={<CareRequestsActive />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.CareRequestsCompleted]}
          element={<CareRequestsCompleted />}
        />
        <Route path="care-requests/:requestId" element={<CareRequestDetails />} />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.Reviews]}
          element={<ProviderReviews />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.Notifications]}
          element={<ProviderNotifications />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.Verification]}
          element={<ProviderVerification />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.AccountSettings]}
          element={<ProviderAccountSettings />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.Earnings]}
          element={<EarningsOverview />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.EarningsPayouts]}
          element={<EarningsPayouts />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.EarningsTaxDocuments]}
          element={<EarningsTaxDocuments />}
        />
        <Route
          path={PROVIDER_ROUTE_PATHS[ProviderRoute.EarningsReports]}
          element={<EarningsReports />}
        />
        <Route path="*" element={<ProviderNotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<ProviderNotFound />} />
    </>
  )
);
