import { useState } from "react";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type {
  CandidateStage,
  ClientJobDetails,
  JobCandidate,
} from "../../../../../queries/client";
import { formatCents } from "../../../../../utils/formatters";
import {
  budgetLabel,
  plural,
  relativeDay,
  scheduleLabel,
} from "../../OpenJobs/jobOverviewDisplay";
import { formatLongDate, urgencyLabel } from "../../Review/labels";
import type { JobSection } from "../jobLinks";
import { CANDIDATE_STAGE_META, timeAgo } from "../jobDetailsDisplay";
import CandidateRow, { MatchPill } from "./CandidateRow";
import SectionCard from "./SectionCard";

type HiringProps = {
  details: ClientJobDetails;
  highlighted: JobSection | null;
  onPreview: (action: string) => void;
};

const smallButton = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 999,
} as const;

/** What the seeker should do next, by where the job is. */
const nextStep = ({ job, applicants }: ClientJobDetails): string => {
  const { pipeline } = job;
  switch (job.status) {
    case "paused":
      return "The job is paused — resume it to receive new applications.";
    case "offer_sent":
      return job.offer
        ? `Waiting for ${job.offer.caregiverName} to accept your offer (it expires ${relativeDay(job.offer.expiresAt)}).`
        : "Waiting for an answer to your offer.";
    case "interviewing":
      return pipeline.newApplicants > 0
        ? `Finish your interviews — and review ${plural(pipeline.newApplicants, "new applicant")}.`
        : "Finish your interviews, then send an offer to your favorite.";
    default:
      if (pipeline.applied === 0) {
        return pipeline.recommended > 0
          ? "Invite some of the AI-picked caregivers to apply."
          : "Your job is open — caregivers can find it and apply.";
      }
      if (pipeline.newApplicants > 0) {
        return `Review ${plural(pipeline.newApplicants, "new applicant")}.`;
      }
      return applicants.some((item) => item.stage === "shortlisted")
        ? "Invite shortlisted applicants to an interview."
        : "Shortlist the applicants you like.";
  }
};

/** Views → AI picks → applied → interviewing → offer → hired. */
export const HiringFunnelCard = ({
  details,
}: {
  details: ClientJobDetails;
}) => {
  const { job, views } = details;
  const steps = [
    { label: "Views", value: views ?? "—" },
    { label: "AI picks", value: job.pipeline.recommended },
    { label: "Applied", value: job.pipeline.applied },
    { label: "Interviewing", value: job.pipeline.interviewing },
    { label: "Offers", value: job.status === "offer_sent" ? 1 : 0 },
  ];

  return (
    <SectionCard
      title="Hiring progress"
      icon={<TimelineOutlinedIcon fontSize="small" />}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(3, 1fr)",
            sm: `repeat(${steps.length}, 1fr)`,
          },
          gap: 1,
        }}
      >
        {steps.map((step, index) => (
          <Box
            key={step.label}
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
              opacity: job.status === "paused" ? 0.6 : 1,
              position: "relative",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {index + 1}. {step.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} lineHeight={1.3}>
              {step.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Alert
        severity={job.status === "paused" ? "warning" : "info"}
        icon={<FlagOutlinedIcon fontSize="inherit" />}
        sx={{ py: 0, "& .MuiAlert-message": { py: 0.75 } }}
      >
        <strong>Next step:</strong> {nextStep(details)}
      </Alert>
    </SectionCard>
  );
};

/** The offer waiting for an answer (`offer_sent`). */
export const OfferCard = ({ details, highlighted, onPreview }: HiringProps) => {
  const { job, applicants } = details;
  const candidate = applicants.find((item) => item.stage === "offer");
  if (!job.offer || !candidate) return null;

  return (
    <SectionCard
      title="Offer"
      section="offer"
      highlighted={highlighted === "offer"}
      icon={<LocalOfferOutlinedIcon fontSize="small" />}
      subtitle={`Sent ${timeAgo(job.offer.sentAt)} · expires ${relativeDay(job.offer.expiresAt)}`}
    >
      <CandidateRow
        candidate={candidate}
        showStage
        actions={
          <>
            <Button
              size="small"
              onClick={() => onPreview(`Message ${candidate.name}`)}
              sx={smallButton}
            >
              Message
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onPreview("Withdraw offer")}
              sx={smallButton}
            >
              Withdraw
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
        {[
          ["Pay", budgetLabel(job)],
          ["Schedule", scheduleLabel(job)],
          [
            "Start",
            job.details.visit
              ? formatLongDate(job.details.visit.date)
              : (urgencyLabel(job.details.recurring?.careUrgency ?? null) ??
                "To agree"),
          ],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
};

type ApplicantTab = "all" | CandidateStage;

const TAB_ORDER: CandidateStage[] = [
  "new",
  "shortlisted",
  "interviewing",
  "offer",
  "reviewed",
  "declined",
];

/** Everyone who applied: proposals with match, rate and cover note. */
export const ApplicantsCard = ({
  details,
  highlighted,
  onPreview,
}: HiringProps) => {
  const { applicants, job } = details;
  const [tab, setTab] = useState<ApplicantTab>(
    job.pipeline.newApplicants > 0 ? "new" : "all",
  );
  const counts = TAB_ORDER.map((stage) => ({
    stage,
    count: applicants.filter((item) => item.stage === stage).length,
  })).filter((entry) => entry.count > 0);
  const visible =
    tab === "all"
      ? applicants
      : applicants.filter((item) => item.stage === tab);

  const rate = (candidate: JobCandidate) =>
    candidate.proposedRateCents !== null
      ? `${formatCents(candidate.proposedRateCents)}/h`
      : "Fixed price";

  return (
    <SectionCard
      title="Applicants"
      section="applicants"
      highlighted={highlighted === "applicants"}
      icon={<GroupsOutlinedIcon fontSize="small" />}
      subtitle={
        applicants.length > 0
          ? `${plural(applicants.length, "proposal")}${
              job.pipeline.newApplicants > 0
                ? ` · ${job.pipeline.newApplicants} new`
                : ""
            }`
          : undefined
      }
    >
      {applicants.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No applications yet.{" "}
          {job.status === "paused"
            ? "The job is paused, so caregivers cannot apply right now."
            : job.pipeline.recommended > 0
              ? "Caregivers can apply as soon as they see the job — invite the AI picks to speed things up."
              : "Caregivers can apply as soon as they see the job."}
        </Typography>
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={(_event, next: ApplicantTab) => setTab(next)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{
              minHeight: 36,
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                minHeight: 36,
                textTransform: "none",
                fontWeight: 600,
                px: 1.5,
              },
            }}
          >
            <Tab value="all" label={`All (${applicants.length})`} />
            {counts.map(({ stage, count }) => (
              <Tab
                key={stage}
                value={stage}
                label={`${CANDIDATE_STAGE_META[stage].label} (${count})`}
              />
            ))}
          </Tabs>
          <Stack divider={<Divider flexItem />} spacing={1.75}>
            {visible.map((candidate) => (
              <CandidateRow
                key={candidate.key}
                candidate={candidate}
                showStage
                detail={`${candidate.headline} · ${candidate.distanceMiles} mi away`}
                actions={
                  <Stack alignItems="flex-end" spacing={0.25}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {rate(candidate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {candidate.appliedAt
                        ? `Applied ${timeAgo(candidate.appliedAt)}`
                        : ""}
                    </Typography>
                  </Stack>
                }
              >
                <Stack spacing={1}>
                  {candidate.coverNote ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      “{candidate.coverNote}”
                    </Typography>
                  ) : null}
                  <Stack
                    direction="row"
                    spacing={0.75}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <MatchPill
                      score={candidate.matchScore}
                      reasons={candidate.matchReasons}
                    />
                    <Box sx={{ flex: 1 }} />
                    <Button
                      size="small"
                      onClick={() =>
                        onPreview(`Proposal from ${candidate.name}`)
                      }
                      sx={smallButton}
                    >
                      View proposal
                    </Button>
                    <Button
                      size="small"
                      onClick={() => onPreview(`Message ${candidate.name}`)}
                      sx={smallButton}
                    >
                      Message
                    </Button>
                    {candidate.stage === "new" ||
                    candidate.stage === "reviewed" ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onPreview(`Shortlist ${candidate.name}`)}
                        sx={smallButton}
                      >
                        Shortlist
                      </Button>
                    ) : null}
                    {candidate.stage === "shortlisted" ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() =>
                          onPreview(`Invite ${candidate.name} to an interview`)
                        }
                        sx={smallButton}
                      >
                        Invite to interview
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              </CandidateRow>
            ))}
          </Stack>
        </>
      )}
    </SectionCard>
  );
};
