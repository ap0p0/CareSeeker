import { Avatar, Stack, Typography } from "@mui/material";
import { accountSettingsPath } from "../AccountSettings/settingsTabs";
import { OverviewCard } from "../../../../components/OverviewCard";
import ProviderProfileSectionPage from "./ProviderProfileSectionPage";

const ProfilePhotos = () => (
  <ProviderProfileSectionPage
    title="Photos"
    description="The profile picture care seekers see next to your name."
  >
    {(overview) => (
      <OverviewCard
        title="Profile picture"
        editTo={accountSettingsPath("personal")}
        editLabel="Change"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={overview.profile.profileImageUrl ?? undefined}
            alt={`${overview.profile.name} ${overview.profile.surname}`}
            sx={{ width: 120, height: 120, fontSize: 40 }}
          >
            {overview.profile.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {overview.profile.profileImageUrl
              ? "Looking good. You can replace it any time from your personal information settings."
              : "No picture yet — add one to make your profile more trustworthy."}
          </Typography>
        </Stack>
      </OverviewCard>
    )}
  </ProviderProfileSectionPage>
);

export default ProfilePhotos;
