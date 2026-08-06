import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminAuthLoadingScreen } from "./AdminAuthLoadingScreen";
import { useAdminAuth } from "./AdminAuthContext";

/**
 * Central admin route guard: Supabase session is not enough — requires a successful
 * GET /admin/me (see `fetchAdminMe`). Nest all protected admin routes under this element.
 */
const RequireAdmin = () => {
  const location = useLocation();
  const { initialized, adminUser } = useAdminAuth();

  if (!initialized) {
    return <AdminAuthLoadingScreen />;
  }

  if (!adminUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default RequireAdmin;
