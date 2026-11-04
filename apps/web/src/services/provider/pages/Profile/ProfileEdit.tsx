import { Navigate } from "react-router-dom";
import { accountSettingsPath } from "../AccountSettings/settingsTabs";

/** Editing lives in account settings; keep the old URL working. */
const ProfileEdit = () => (
  <Navigate to={accountSettingsPath("personal")} replace />
);

export default ProfileEdit;
