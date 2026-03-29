/**
 * Admin app authentication — single integration surface.
 *
 * Architecture:
 * - `fetchAdminMe` — calls GET /admin/me (backend is the source of truth for admin access).
 * - `AdminAuthProvider` + `useAdminAuth` — session sync, cached verified admin user, sign-out.
 * - `RequireAdmin` — route guard: loading until verified, then outlet or redirect to /login.
 * - `signOut` from `useAdminAuth` — use from the admin shell (e.g. layout) then `navigate("/login")`.
 *
 * Add new admin pages under the `RequireAdmin` branch in `adminRoutes.tsx` only; do not
 * re-implement checks inside each page. This module is only wired in the admin app variant.
 */

export {
  AdminAuthProvider,
  useAdminAuth,
  type AdminGateOutcome,
} from "./AdminAuthContext";
export { default as RequireAdmin } from "./RequireAdmin";
export { AdminAuthLoadingScreen } from "./AdminAuthLoadingScreen";
export {
  ADMIN_ACCESS_DENIED_MESSAGE,
  ADMIN_ME_PATH,
  fetchAdminMe,
  type AdminAppUser,
  type AdminMeResult,
} from "./adminMe";
