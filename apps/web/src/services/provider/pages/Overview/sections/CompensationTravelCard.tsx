import { Stack } from "@mui/material";
import type { ProviderWorkPreferences } from "../../../../../queries/provider";
import { accountSettingsPath } from "../../AccountSettings/settingsTabs";
import {
  formatCents,
  jobFrequencyLabels,
  paymentModelLabels,
  vehicleTypeLabel,
} from "../labels";
import {
  ChipList,
  DetailRow,
  MissingSection,
  OverviewCard,
} from "./OverviewCard";

type CompensationTravelCardProps = {
  preferences: ProviderWorkPreferences | null;
  title?: string;
  /** Inline quick edit (overview). */
  onEdit?: () => void;
};

const CompensationTravelCard = ({
  preferences,
  title = "Compensation & travel",
  onEdit,
}: CompensationTravelCardProps) => {
  const editTo = accountSettingsPath("availability");

  return (
    <OverviewCard title={title} editTo={editTo} onEdit={onEdit}>
      {!preferences ? (
        <MissingSection
          text="Rates and travel preferences are not set yet."
          to={editTo}
          onAction={onEdit}
        />
      ) : (
        <Stack spacing={1}>
          <DetailRow
            label="Preferred rate"
            value={`${formatCents(preferences.preferredHourlyRateCents)} / hour`}
          />
          <DetailRow
            label="Minimum rate"
            value={`${formatCents(preferences.minHourlyRateCents)} / hour`}
          />
          <DetailRow
            label="Hours per week"
            value={`${preferences.minWeeklyHours} – ${preferences.maxWeeklyHours} h (single job)`}
          />
          <DetailRow
            label="Payment"
            value={<ChipList items={paymentModelLabels(preferences)} />}
          />
          <DetailRow
            label="Job types"
            value={<ChipList items={jobFrequencyLabels(preferences)} />}
          />
          <DetailRow
            label="Travel distance"
            value={`Up to ${preferences.maxTravelDistanceMiles} miles from home`}
          />
          <DetailRow
            label="Transportation"
            value={
              preferences.offersTransportation
                ? `Own ${vehicleTypeLabel(preferences.vehicleType)?.toLowerCase() ?? "vehicle"}${
                    preferences.vehicleWheelchairAccessible
                      ? ", wheelchair accessible"
                      : ""
                  }`
                : "Not offered"
            }
          />
          {preferences.matchingNotes ? (
            <DetailRow label="Notes" value={preferences.matchingNotes} />
          ) : null}
        </Stack>
      )}
    </OverviewCard>
  );
};

export default CompensationTravelCard;
