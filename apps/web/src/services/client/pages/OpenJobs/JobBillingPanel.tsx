import type { ReactNode } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { JobBilling } from "../../../../queries/client";
import { formatCents } from "../../../../utils/formatters";
import { formatDay, plural } from "./jobOverviewDisplay";

type Tone = "primary" | "success" | "warning" | "error";

type BillingView = {
  tone: Tone;
  icon: ReactNode;
  heading: string;
  /** The big number, if any. */
  figure: string | null;
  detail: string;
};

const hoursLabel = (hours: number) =>
  `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;

/** What to show for each payment state of a hired job. */
const billingView = (
  billing: JobBilling,
  caregiverName: string,
): BillingView => {
  if (billing.paymentType === "hourly") {
    const amount = formatCents(Math.round(billing.rateCents * billing.hours));
    const rate = `${formatCents(billing.rateCents)}/hour`;
    const period = `${formatDay(billing.periodStart)} – ${formatDay(billing.periodEnd)}`;

    switch (billing.state) {
      case "accruing":
        return billing.hours > 0
          ? {
              tone: "primary",
              icon: <ScheduleOutlinedIcon />,
              heading: "Billable hours this week",
              figure: hoursLabel(billing.hours),
              detail: `${amount} so far at ${rate} (${period})${
                billing.dueOn ? ` · invoiced ${formatDay(billing.dueOn)}` : ""
              }`,
            }
          : {
              tone: "primary",
              icon: <ScheduleOutlinedIcon />,
              heading: "No billable hours yet this week",
              figure: null,
              detail: `Hours show up here once ${caregiverName.split(" ")[0]} logs a visit${
                billing.dueOn
                  ? ` · first invoice ${formatDay(billing.dueOn)}`
                  : ""
              }.`,
            };
      case "due":
        return {
          tone: "warning",
          icon: <ReceiptLongOutlinedIcon />,
          heading: "Invoice ready to pay",
          figure: amount,
          detail: `${plural(billing.hours, "hour")} at ${rate} (${period})${
            billing.dueOn ? ` · due ${formatDay(billing.dueOn)}` : ""
          }`,
        };
      case "overdue":
        return {
          tone: "error",
          icon: <ErrorOutlineIcon />,
          heading: "Payment overdue",
          figure: amount,
          detail: `${plural(billing.hours, "hour")} at ${rate} (${period})${
            billing.dueOn ? ` · was due ${formatDay(billing.dueOn)}` : ""
          }`,
        };
      case "paid":
        return {
          tone: "success",
          icon: <CheckCircleOutlineIcon />,
          heading: "All is good",
          figure: null,
          detail: `Everything is paid${
            billing.paidOn
              ? ` — last invoice paid ${formatDay(billing.paidOn)}`
              : ""
          }.`,
        };
    }
  }

  const amount = formatCents(billing.amountCents);
  switch (billing.state) {
    case "due":
      return {
        tone: "warning",
        icon: <ReceiptLongOutlinedIcon />,
        heading: "Fixed price to pay",
        figure: amount,
        detail: billing.dueOn
          ? `Due ${formatDay(billing.dueOn)}`
          : "Due after the job",
      };
    case "overdue":
      return {
        tone: "error",
        icon: <ErrorOutlineIcon />,
        heading: "Payment overdue",
        figure: amount,
        detail: billing.dueOn
          ? `Fixed price · was due ${formatDay(billing.dueOn)}`
          : "Fixed price",
      };
    case "paid":
      return {
        tone: "success",
        icon: <CheckCircleOutlineIcon />,
        heading: "All is good",
        figure: null,
        detail: `${amount} fixed price, paid in full${
          billing.paidOn ? ` on ${formatDay(billing.paidOn)}` : ""
        }.`,
      };
  }
};

/** Payment status of a hired job: hours, amount due, or "All is good". */
const JobBillingPanel = ({
  billing,
  caregiverName,
}: {
  billing: JobBilling;
  caregiverName: string;
}) => {
  const view = billingView(billing, caregiverName);

  return (
    <Box
      sx={(theme) => ({
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: alpha(theme.palette[view.tone].main, 0.35),
        bgcolor: alpha(theme.palette[view.tone].main, 0.06),
      })}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: `${view.tone}.main`, display: "flex", mt: 0.25 }}>
          {view.icon}
        </Box>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            spacing={1}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={`${view.tone}.dark`}
            >
              {view.heading}
            </Typography>
            {view.figure ? (
              <Typography
                variant="h6"
                fontWeight={700}
                lineHeight={1.2}
                sx={{ whiteSpace: "nowrap" }}
              >
                {view.figure}
              </Typography>
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {view.detail}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default JobBillingPanel;
