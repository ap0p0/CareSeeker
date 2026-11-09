import { Stack } from "@mui/material";
import {
  DetailRow,
  OverviewCard,
} from "../../../../../components/OverviewCard";
import type { SeekerRegistrant } from "../../../../../queries/client";
import { formatUsPhone } from "../../../../../utils/usPhone";
import { relationshipLabel } from "../labels";

type RegistrantCardProps = {
  registrant: SeekerRegistrant;
  onEdit: () => void;
};

/** Step 1: the person who opened the account. */
const RegistrantCard = ({ registrant, onEdit }: RegistrantCardProps) => (
  <OverviewCard
    title="About you"
    description="The account holder and the person caregivers will contact."
    onEdit={onEdit}
  >
    <Stack spacing={1}>
      <DetailRow
        label="Name"
        value={`${registrant.name} ${registrant.surname}`.trim()}
      />
      <DetailRow label="Email" value={registrant.email} />
      <DetailRow label="Phone" value={formatUsPhone(registrant.phone)} />
      <DetailRow
        label="Relationship"
        value={relationshipLabel(
          registrant.relationship,
          registrant.relationshipOther,
        )}
      />
    </Stack>
  </OverviewCard>
);

export default RegistrantCard;
