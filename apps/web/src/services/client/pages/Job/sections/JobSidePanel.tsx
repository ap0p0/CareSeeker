import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import {
  Badge,
  Box,
  Button,
  ButtonBase,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import type {
  ClientJobDetails,
  JobCandidate,
} from "../../../../../queries/client";
import type { JobSection } from "../jobLinks";
import { dateTimeLabel, timeAgo } from "../jobDetailsDisplay";
import CandidateRow, { CandidateAvatar, MatchPill } from "./CandidateRow";
import SectionCard from "./SectionCard";

type JobSidePanelProps = {
  details: ClientJobDetails;
  highlighted: JobSection | null;
  /** Actions that are not built yet (messaging, invites…): a notice. */
  onPreview: (action: string) => void;
};

const smallButton = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 999,
} as const;

const Empty = ({ children }: { children: string }) => (
  <Typography variant="body2" color="text.secondary">
    {children}
  </Typography>
);

/** Conversations about this job, unread first. */
const MessagesCard = ({
  details,
  highlighted,
  onPreview,
}: JobSidePanelProps) => {
  const { conversations, job } = details;
  const unread = conversations.reduce((sum, item) => sum + item.unread, 0);

  return (
    <SectionCard
      title="Messages"
      section="messages"
      highlighted={highlighted === "messages"}
      icon={<ChatBubbleOutlineIcon fontSize="small" />}
      subtitle={
        unread > 0
          ? `${unread} unread`
          : conversations.length > 0
            ? "All caught up"
            : undefined
      }
      action={
        conversations.length > 0 ? (
          <Button
            size="small"
            onClick={() => onPreview("Open messages")}
            sx={smallButton}
          >
            Open
          </Button>
        ) : null
      }
    >
      {conversations.length === 0 ? (
        <Empty>
          {job.status === "open"
            ? "No messages yet. Caregivers who apply can write to you here."
            : "No messages about this job."}
        </Empty>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {conversations.map((conversation) => (
            <ButtonBase
              key={conversation.key}
              onClick={() =>
                onPreview(`Conversation with ${conversation.name}`)
              }
              sx={{
                justifyContent: "flex-start",
                textAlign: "left",
                borderRadius: 2,
                p: 0.5,
                mx: -0.5,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
                width="100%"
              >
                <Badge
                  color="error"
                  badgeContent={conversation.unread}
                  overlap="circular"
                >
                  <CandidateAvatar name={conversation.name} size={34} />
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={conversation.unread > 0 ? 700 : 600}
                      noWrap
                    >
                      {conversation.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ flexShrink: 0 }}
                    >
                      {timeAgo(conversation.at)}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="div"
                  >
                    {conversation.role}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={
                      conversation.unread > 0
                        ? "text.primary"
                        : "text.secondary"
                    }
                    noWrap
                  >
                    {conversation.fromThem ? "" : "You: "}
                    {conversation.lastMessage}
                  </Typography>
                </Box>
              </Stack>
            </ButtonBase>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
};

/** Reasons not already shown on the row (distance, rating). */
const extraReasons = (candidate: JobCandidate) =>
  candidate.matchReasons.filter(
    (reason) => !reason.endsWith(" mi away") && !reason.includes("★"),
  );

/**
 * The best AI matches, with why they fit. Once a caregiver is hired they
 * become backup options (no invitations).
 */
const AiPicksCard = ({
  details,
  highlighted,
  onPreview,
}: JobSidePanelProps) => {
  const { aiPicks, job } = details;
  const hired = job.status === "hired";

  return (
    <SectionCard
      title={hired ? "Backup caregivers" : "AI picked caregivers"}
      section="recommendations"
      highlighted={highlighted === "recommendations"}
      icon={<AutoAwesomeOutlinedIcon fontSize="small" />}
      subtitle={
        hired
          ? "AI matches, in case you ever need a replacement"
          : job.pipeline.recommended > 0
            ? `${job.pipeline.recommended} matches for this job`
            : undefined
      }
      action={
        job.pipeline.recommended > aiPicks.length ? (
          <Button
            size="small"
            onClick={() => onPreview("See all AI picks")}
            sx={smallButton}
          >
            See all
          </Button>
        ) : null
      }
    >
      {aiPicks.length === 0 ? (
        <Empty>No AI matches yet.</Empty>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1.5}>
          {aiPicks.map((candidate) => (
            <CandidateRow
              key={candidate.key}
              candidate={candidate}
              detail={`${candidate.distanceMiles} mi away · ${candidate.yearsExperience} yrs experience`}
            >
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
                {hired ? null : candidate.stage === "recommended" ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onPreview(`Invite ${candidate.name}`)}
                    sx={{ ...smallButton, py: 0, minHeight: 24 }}
                    disabled={job.status === "paused"}
                    title={
                      job.status === "paused"
                        ? "Resume the job to invite caregivers"
                        : undefined
                    }
                  >
                    Invite to apply
                  </Button>
                ) : (
                  <Chip
                    label="Already applied"
                    size="small"
                    variant="outlined"
                    sx={{ height: 22 }}
                  />
                )}
              </Stack>
              {extraReasons(candidate).length > 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                  mt={0.5}
                >
                  {extraReasons(candidate).join(" · ")}
                </Typography>
              ) : null}
            </CandidateRow>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
};

/** Candidates in interviews (and the one holding an offer). */
const InterviewingCard = ({
  details,
  highlighted,
  onPreview,
}: JobSidePanelProps) => {
  const { applicants, job } = details;
  const inProgress = applicants.filter(
    (candidate) =>
      candidate.stage === "interviewing" || candidate.stage === "offer",
  );
  const hired = applicants.find((candidate) => candidate.stage === "hired");

  const subtitle = (candidate: JobCandidate) =>
    candidate.stage === "offer"
      ? "Offer sent — waiting for an answer"
      : candidate.interviewAt
        ? `Interview ${dateTimeLabel(candidate.interviewAt)}`
        : "Interview to schedule";

  return (
    <SectionCard
      title="Interviewing"
      section="candidates"
      highlighted={highlighted === "candidates"}
      icon={<HowToRegOutlinedIcon fontSize="small" />}
      subtitle={
        inProgress.length > 0 ? `${inProgress.length} in progress` : undefined
      }
    >
      {inProgress.length === 0 ? (
        <Empty>
          {hired
            ? `${hired.name} is hired — no interviews running.`
            : job.pipeline.applied > 0
              ? "No interviews yet. Shortlist applicants and invite them to talk."
              : "Interviews show up here once you talk to applicants."}
        </Empty>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1.5}>
          {inProgress.map((candidate) => (
            <CandidateRow
              key={candidate.key}
              candidate={candidate}
              showStage
              detail={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <EventOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>{subtitle(candidate)}</span>
                </Stack>
              }
              actions={
                <Button
                  size="small"
                  onClick={() =>
                    onPreview(
                      candidate.stage === "offer"
                        ? `Offer to ${candidate.name}`
                        : `Interview with ${candidate.name}`,
                    )
                  }
                  sx={smallButton}
                >
                  {candidate.stage === "offer" ? "View offer" : "Details"}
                </Button>
              }
            />
          ))}
        </Stack>
      )}
    </SectionCard>
  );
};

/** Top right of the job page. */
const JobSidePanel = (props: JobSidePanelProps) => (
  <Stack spacing={2}>
    <MessagesCard {...props} />
    <AiPicksCard {...props} />
    <InterviewingCard {...props} />
  </Stack>
);

export default JobSidePanel;
