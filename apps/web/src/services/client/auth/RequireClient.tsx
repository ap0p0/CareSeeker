import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../routes/enums";
import { ClientAuthLoadingScreen } from "./ClientAuthLoadingScreen";
import { useClientAuth } from "./ClientAuthContext";

const RequireClient = () => {
  const location = useLocation();
  const { initialized, seekerUser } = useClientAuth();

  if (!initialized) {
    return <ClientAuthLoadingScreen />;
  }

  if (!seekerUser) {
    return (
      <Navigate
        to={SEEKER_ROUTE_PATHS[SeekerRoute.Login]}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default RequireClient;
