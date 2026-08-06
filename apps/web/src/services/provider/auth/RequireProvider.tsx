import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../routes/enums";
import { ProviderAuthLoadingScreen } from "./ProviderAuthLoadingScreen";
import { useProviderAuth } from "./ProviderAuthContext";
import {
  hasProviderMockSession,
  isProviderDevMockEnabled,
} from "./providerDevAuth";

const RequireProvider = () => {
  const location = useLocation();
  const { initialized, providerUser } = useProviderAuth();

  if (!initialized) {
    return <ProviderAuthLoadingScreen />;
  }

  const hasDevMockAccess = isProviderDevMockEnabled && hasProviderMockSession();

  if (!providerUser && !hasDevMockAccess) {
    return (
      <Navigate
        to={PROVIDER_ROUTE_PATHS[ProviderRoute.Login]}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default RequireProvider;
