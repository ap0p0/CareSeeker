import { Box, Stack, Typography } from "@mui/material";
import {
  ChipList,
  DetailRow,
  OverviewCard,
} from "../../../../../components/OverviewCard";
import type { CarePreferences } from "../../../../../queries/client";
import { formatClock } from "../../../../../utils/formatters";
import {
  accessibilityLabels,
  budgetLabel,
  careFlagLabels,
  careScheduleRows,
  caregiverGenderLabel,
  caregiverLanguageLabel,
  durationLabel,
  formatLongDate,
  frequencyLabel,
  qualificationLabels,
  taskLabels,
  urgencyLabel,
} from "../labels";

type CarePreferencesCardProps = {
  /** Saved care preferences, or a job's care details (same shape). */
  preferences: Omit<CarePreferences, "updatedAt">;
  /** Omitted: no Edit button (e.g. a job whose requirements are locked). */
  onEdit?: () => void;
  /** Defaults to "Care needs & preferences". */
  title?: string;
};

const Subheading = ({ children }: { children: string }) => (
  <Typography variant="subtitle2" sx={{ mt: 1 }}>
    {children}
  </Typography>
);

/** Step 3: care needs & assistance preferences (one-time or recurring). */
const CarePreferencesCard = ({
  preferences,
  onEdit,
  title = "Care needs & preferences",
}: CarePreferencesCardProps) => {
  const { visit, recurring, caregiverPreferences } = preferences;
  const flags = careFlagLabels(preferences);
  const qualifications = qualificationLabels(
    caregiverPreferences.requiredQualifications,
  );

  return (
    <OverviewCard
      title={title}
      description={frequencyLabel(preferences.careFrequency)}
      onEdit={onEdit}
    >
      <Stack spacing={1}>
        <DetailRow
          label="Help needed"
          value={<ChipList items={taskLabels(preferences.careTasks)} />}
        />

        {visit ? (
          <>
            <DetailRow
              label="Visit"
              value={`${formatLongDate(visit.date)}, ${formatClock(
                visit.startTime,
              )} – ${formatClock(visit.endTime)}`}
            />
            {visit.notes ? (
              <DetailRow label="About the visit" value={visit.notes} />
            ) : null}
          </>
        ) : null}

        {recurring ? (
          <>
            <DetailRow
              label="Hours per week"
              value={
                recurring.hoursPerWeek
                  ? `About ${recurring.hoursPerWeek}`
                  : null
              }
            />
            <DetailRow
              label="Duration"
              value={durationLabel(recurring.careDuration)}
            />
            <DetailRow
              label="Start"
              value={urgencyLabel(recurring.careUrgency)}
            />
            <DetailRow
              label="Schedule"
              value={
                <Box
                  component="dl"
                  sx={{
                    m: 0,
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    columnGap: 2,
                    rowGap: 0.25,
                  }}
                >
                  {careScheduleRows(preferences).map((row) => (
                    <Box key={row.day} sx={{ display: "contents" }}>
                      <Typography
                        component="dt"
                        variant="body2"
                        fontWeight={600}
                      >
                        {row.day}
                      </Typography>
                      <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                        {row.summary}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
            />
          </>
        ) : null}

        <DetailRow label="Budget" value={budgetLabel(preferences)} />

        <Subheading>Special requirements</Subheading>
        <DetailRow
          label="Good to know"
          value={<ChipList items={flags} emptyText="Nothing special" />}
        />
        <DetailRow
          label="At home"
          value={
            <ChipList
              items={accessibilityLabels(preferences.homeAccessibility)}
              emptyText="Not specified"
            />
          }
        />
        {preferences.specialRequirements ? (
          <DetailRow
            label="Care instructions"
            value={preferences.specialRequirements}
          />
        ) : null}

        <Subheading>Caregiver preferences</Subheading>
        <DetailRow
          label="Gender"
          value={caregiverGenderLabel(caregiverPreferences.gender)}
        />
        <DetailRow
          label="Language"
          value={caregiverLanguageLabel(caregiverPreferences.language)}
        />
        <DetailRow
          label="Qualifications"
          value={<ChipList items={qualifications} emptyText="No requirement" />}
        />
        <DetailRow
          label="Experience"
          value={
            caregiverPreferences.minYearsExperience
              ? `At least ${caregiverPreferences.minYearsExperience} ${
                  caregiverPreferences.minYearsExperience === 1
                    ? "year"
                    : "years"
                }`
              : "No minimum"
          }
        />
        {caregiverPreferences.culturalConsiderations ? (
          <DetailRow
            label="Cultural / religious"
            value={caregiverPreferences.culturalConsiderations}
          />
        ) : null}
      </Stack>
    </OverviewCard>
  );
};

export default CarePreferencesCard;
