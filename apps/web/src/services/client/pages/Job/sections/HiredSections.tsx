import dayjs from "dayjs";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  type ChipProps,
} from "@mui/material";
import type {
  ClientJobDetails,
  JobInvoice,
} from "../../../../../queries/client";
import { formatCents } from "../../../../../utils/formatters";
import JobBillingPanel from "../../OpenJobs/JobBillingPanel";
import {
  formatDay,
  scheduleLabel,
  visitLabel,
} from "../../OpenJobs/jobOverviewDisplay";
import type { JobSection } from "../jobLinks";
import CandidateRow from "./CandidateRow";
import SectionCard from "./SectionCard";

type HiredProps = {
  details: ClientJobDetails;
  highlighted: JobSection | null;
  onPreview: (action: string) => void;
};

const smallButton = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 999,
} as const;

const Term = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

/** Who is working on the job and on what terms. */
export const ContractCard = ({ details, onPreview }: HiredProps) => {
  const { job, applicants } = details;
  const caregiver = applicants.find((item) => item.stage === "hired");
  if (!job.caregiver || !caregiver) return null;
  const billing = job.billing;
  const pay =
    billing?.paymentType === "hourly"
      ? `${formatCents(billing.rateCents)} / hour`
      : billing
        ? `${formatCents(billing.amountCents)} fixed price`
        : "—";

  return (
    <SectionCard
      title="Contract"
      icon={<AssignmentTurnedInOutlinedIcon fontSize="small" />}
      subtitle={`Active since ${formatDay(job.caregiver.startedOn)}`}
    >
      <CandidateRow
        candidate={caregiver}
        actions={
          <>
            <Button
              size="small"
              onClick={() => onPreview(`Message ${caregiver.name}`)}
              sx={smallButton}
            >
              Message
            </Button>
            <Button
              size="small"
              onClick={() => onPreview("View contract")}
              sx={smallButton}
            >
              Contract
            </Button>
          </>
        }
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
        }}
      >
        <Term label="Pay" value={pay} />
        <Term label="Schedule" value={scheduleLabel(job)} />
        <Term
          label="Next visit"
          value={
            job.caregiver.nextVisitAt
              ? visitLabel(job.caregiver.nextVisitAt)
              : "None scheduled"
          }
        />
      </Box>
    </SectionCard>
  );
};

const INVOICE_STATE: Record<
  JobInvoice["state"],
  { label: string; color: ChipProps["color"] }
> = {
  in_progress: { label: "This week", color: "default" },
  due: { label: "Due", color: "warning" },
  overdue: { label: "Overdue", color: "error" },
  paid: { label: "Paid", color: "success" },
};

/** What is owed now (the card's billing panel) and past invoices. */
export const PaymentsCard = ({ details, onPreview }: HiredProps) => {
  const { job, invoices } = details;
  if (!job.billing || !job.caregiver) return null;
  const due = invoices.some(
    (invoice) => invoice.state === "due" || invoice.state === "overdue",
  );

  return (
    <SectionCard
      title="Payments"
      icon={<ReceiptLongOutlinedIcon fontSize="small" />}
      action={
        due ? (
          <Button
            size="small"
            variant="contained"
            color={
              invoices.some((invoice) => invoice.state === "overdue")
                ? "error"
                : "primary"
            }
            onClick={() => onPreview("Pay now")}
            sx={smallButton}
          >
            Pay now
          </Button>
        ) : null
      }
    >
      <JobBillingPanel
        billing={job.billing}
        caregiverName={job.caregiver.name}
      />
      {invoices.length > 0 ? (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {invoices.map((invoice) => {
            const state = INVOICE_STATE[invoice.state];
            return (
              <Stack
                key={invoice.key}
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {invoice.date
                      ? invoice.state === "paid"
                        ? `Paid ${formatDay(invoice.date)}`
                        : invoice.state === "in_progress"
                          ? `Invoiced ${formatDay(invoice.date)}`
                          : `Due ${formatDay(invoice.date)}`
                      : ""}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={700}>
                  {formatCents(invoice.amountCents)}
                </Typography>
                <Chip
                  label={state.label}
                  color={state.color}
                  size="small"
                  variant={invoice.state === "paid" ? "outlined" : "filled"}
                  sx={{ minWidth: 72 }}
                />
              </Stack>
            );
          })}
        </Stack>
      ) : null}
    </SectionCard>
  );
};

/** Recent and upcoming visits of the hired caregiver. */
export const TimesheetCard = ({ details, highlighted }: HiredProps) => {
  const { visits, job } = details;
  if (visits.length === 0) return null;
  const weekStart = dayjs().startOf("week");
  const hoursThisWeek = visits
    .filter(
      (visit) =>
        visit.state === "completed" && !dayjs(visit.at).isBefore(weekStart),
    )
    .reduce((sum, visit) => sum + visit.hours, 0);

  return (
    <SectionCard
      title="Timesheet"
      section="timesheet"
      highlighted={highlighted === "timesheet"}
      icon={<ScheduleOutlinedIcon fontSize="small" />}
      subtitle={
        job.billing?.paymentType === "hourly"
          ? `${hoursThisWeek} h logged this week`
          : "Visits"
      }
    >
      <Stack divider={<Divider flexItem />} spacing={1}>
        {visits.map((visit) => (
          <Stack key={visit.at} direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {visitLabel(visit.at)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {visit.hours} h
            </Typography>
            <Chip
              label={visit.state === "scheduled" ? "Upcoming" : "Completed"}
              color={visit.state === "scheduled" ? "primary" : "default"}
              variant="outlined"
              size="small"
              sx={{ minWidth: 96 }}
            />
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
};
