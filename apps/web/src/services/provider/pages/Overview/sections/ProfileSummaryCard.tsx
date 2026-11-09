import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import type { ProviderOverview } from "../../../../../queries/provider";
import { accountSettingsPath } from "../../AccountSettings/settingsTabs";
import { genderLabel, professionalTitle, stateLabel } from "../labels";
import {
  DetailRow,
  OverviewCard,
} from "../../../../../components/OverviewCard";

type ProfileSummaryCardProps = {
  overview: ProviderOverview;
  /** Hide the completion block (e.g. on the personal information page). */
  showCompletion?: boolean;
  /** Inline quick edit (overview). */
  onEdit?: () => void;
};

const ProfileSummaryCard = ({
  overview,
  showCompletion = true,
  onEdit,
}: ProfileSummaryCardProps) => {
  const { profile, serviceProfile, completion } = overview;
  const fullName = `${profile.name} ${profile.surname}`.trim();
  const title = serviceProfile
    ? professionalTitle(
        serviceProfile.careServices,
        serviceProfile.otherCareService,
      )
    : null;
  const location = profile.address
    ? `${profile.address.city}, ${stateLabel(profile.address.state)}`
    : null;
  const missing = completion.sections.filter((section) => !section.complete);

  return (
    <OverviewCard
      title="Profile"
      editTo={accountSettingsPath("personal")}
      onEdit={onEdit}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Avatar
          src={profile.profileImageUrl ?? undefined}
          alt={fullName}
          sx={{ width: 96, height: 96, fontSize: 32 }}
        >
          {profile.name.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700}>
            {fullName}
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {title ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <WorkOutlineIcon fontSize="small" color="action" />
                <Typography variant="body2">{title}</Typography>
              </Stack>
            ) : null}
            {location ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <PlaceOutlinedIcon fontSize="small" color="action" />
                <Typography variant="body2">{location}</Typography>
              </Stack>
            ) : null}
          </Stack>
          {serviceProfile ? (
            <Chip
              label={`${serviceProfile.yearsOfExperience} ${
                serviceProfile.yearsOfExperience === 1 ? "year" : "years"
              } of experience`}
              size="small"
              sx={{ mt: 1 }}
            />
          ) : null}
        </Box>
      </Stack>

      {serviceProfile?.coverLetter ? (
        <Typography variant="body2" color="text.secondary">
          {serviceProfile.coverLetter}
        </Typography>
      ) : null}

      <Stack spacing={1}>
        <DetailRow label="Email" value={profile.email} />
        <DetailRow label="Phone" value={profile.phone} />
        <DetailRow
          label="Address"
          value={
            profile.address
              ? `${profile.address.addressLine1}, ${profile.address.city}, ${profile.address.state} ${profile.address.postalCode}`
              : null
          }
        />
        <DetailRow label="Date of birth" value={profile.dateOfBirth} />
        <DetailRow label="Gender" value={genderLabel(profile.gender)} />
      </Stack>

      {showCompletion ? (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="subtitle2">Profile completion</Typography>
            <Typography variant="subtitle2">
              {completion.percentage}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completion.percentage}
            aria-label="Profile completion"
            sx={{ height: 10, borderRadius: 999 }}
          />
          {missing.length > 0 ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.75, display: "block" }}
            >
              Still missing:{" "}
              {missing.map((section) => section.label).join(", ")}
            </Typography>
          ) : (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ mt: 0.75, display: "block" }}
            >
              Your profile is complete.
            </Typography>
          )}
        </Box>
      ) : null}
    </OverviewCard>
  );
};

export default ProfileSummaryCard;
