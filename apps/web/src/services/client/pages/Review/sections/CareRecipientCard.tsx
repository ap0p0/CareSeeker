import { Stack, Typography } from "@mui/material";
import {
  ChipList,
  DetailRow,
  OverviewCard,
} from "../../../../../components/OverviewCard";
import type { CareRecipient } from "../../../../../queries/client";
import {
  ethnicBackgroundLabel,
  formatLongDate,
  genderLabel,
  livingSituationLabel,
  mobilityLabel,
  spokenLanguageLabels,
  stateLabel,
} from "../labels";

type CareRecipientCardProps = {
  recipient: CareRecipient;
  onEdit: () => void;
};

/** Step 2: the person who needs care. */
const CareRecipientCard = ({ recipient, onEdit }: CareRecipientCardProps) => (
  <OverviewCard
    title="Who needs care"
    description="Identity, home and daily life of the person receiving care."
    onEdit={onEdit}
  >
    <Stack spacing={1}>
      <DetailRow
        label="Name"
        value={`${recipient.name} ${recipient.surname}`.trim()}
      />
      <DetailRow
        label="Date of birth"
        value={formatLongDate(recipient.dateOfBirth)}
      />
      <DetailRow label="Gender" value={genderLabel(recipient.gender)} />
      <DetailRow
        label="Address"
        value={`${recipient.addressLine1}, ${recipient.city}, ${stateLabel(
          recipient.state,
        )} ${recipient.postalCode}`}
      />
      <DetailRow
        label="Living situation"
        value={livingSituationLabel(recipient.livingSituation)}
      />
      <DetailRow
        label="Mobility"
        value={mobilityLabel(recipient.mobilityLevel)}
      />
      <DetailRow
        label="Languages"
        value={
          <ChipList
            items={spokenLanguageLabels(
              recipient.languagesSpoken,
              recipient.otherLanguage,
            )}
          />
        }
      />
      <DetailRow
        label="Ethnic background"
        value={ethnicBackgroundLabel(recipient.ethnicBackground)}
      />
    </Stack>
    {recipient.additionalInfo ? (
      <Typography variant="body2" color="text.secondary">
        “{recipient.additionalInfo}”
      </Typography>
    ) : null}
  </OverviewCard>
);

export default CareRecipientCard;
