import { Box, Stack, Typography } from "@mui/material";
import type { ProviderWorkPreferences } from "../../../../../queries/provider";
import { accountSettingsPath } from "../../AccountSettings/settingsTabs";
import {
  availabilityStartLabel,
  formatDate,
  weeklyScheduleRows,
  workTypeLabel,
} from "../labels";
import {
  ChipList,
  DetailRow,
  MissingSection,
  OverviewCard,
} from "./OverviewCard";

type AvailabilityCardProps = {
  preferences: ProviderWorkPreferences | null;
  /** Inline quick edit (overview). */
  onEdit?: () => void;
};

const AvailabilityCard = ({ preferences, onEdit }: AvailabilityCardProps) => {
  const editTo = accountSettingsPath("availability");

  return (
    <OverviewCard title="Availability" editTo={editTo} onEdit={onEdit}>
      {!preferences ? (
        <MissingSection
          text="You have not set your availability yet."
          to={editTo}
          onAction={onEdit}
        />
      ) : (
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 0.75,
            }}
          >
            {weeklyScheduleRows(preferences.workingDays).map((row) => (
              <Box
                key={row.day}
                sx={{
                  display: "flex",
                  gap: 1,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: row.available ? "action.hover" : "transparent",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ minWidth: 88 }}
                  color={row.available ? "text.primary" : "text.secondary"}
                >
                  {row.day}
                </Typography>
                <Typography
                  variant="body2"
                  color={row.available ? "text.primary" : "text.secondary"}
                >
                  {row.summary}
                </Typography>
              </Box>
            ))}
          </Box>

          <Stack spacing={1}>
            <DetailRow
              label="Work type"
              value={workTypeLabel(preferences.workType)}
            />
            <DetailRow
              label="Start"
              value={
                preferences.availabilityStart === "specific_date"
                  ? `From ${formatDate(preferences.availableFrom)}`
                  : availabilityStartLabel(preferences.availabilityStart)
              }
            />
            <DetailRow
              label="Also available for"
              value={
                <ChipList
                  items={[
                    preferences.availableOvernight ? "Overnight care" : null,
                    preferences.availableLiveIn ? "Live-in care" : null,
                    preferences.availableEmergency
                      ? "Emergency / short notice"
                      : null,
                  ].filter((item): item is string => item !== null)}
                  emptyText="Regular hours only"
                />
              }
            />
          </Stack>
        </Stack>
      )}
    </OverviewCard>
  );
};

export default AvailabilityCard;
