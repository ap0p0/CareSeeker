import type { ReactNode } from "react";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Avatar, Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import type { JobCandidate } from "../../../../../queries/client";
import { CANDIDATE_STAGE_META, initials } from "../jobDetailsDisplay";

/** Match score as a small colored pill ("92% match"). */
export const MatchPill = ({
  score,
  reasons,
}: {
  score: number;
  reasons: string[];
}) => (
  <Tooltip
    title={
      reasons.length > 0 ? `Why: ${reasons.join(" · ")}` : "AI match score"
    }
  >
    <Chip
      label={`${score}% match`}
      size="small"
      color={score >= 85 ? "success" : score >= 70 ? "primary" : "default"}
      variant={score >= 85 ? "filled" : "outlined"}
      sx={{ fontWeight: 700, height: 22 }}
    />
  </Tooltip>
);

export const CandidateAvatar = ({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      fontSize: size * 0.38,
      fontWeight: 700,
      bgcolor: "primary.light",
    }}
  >
    {initials(name)}
  </Avatar>
);

export const RatingLabel = ({
  rating,
  reviews,
}: {
  rating: number | null;
  reviews: number;
}) =>
  rating === null ? (
    <Typography variant="caption" color="text.secondary">
      New caregiver
    </Typography>
  ) : (
    <Stack direction="row" alignItems="center" spacing={0.25}>
      <StarRoundedIcon sx={{ fontSize: 16, color: "warning.main" }} />
      <Typography variant="caption" fontWeight={600}>
        {rating.toFixed(1)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        ({reviews})
      </Typography>
    </Stack>
  );

type CandidateRowProps = {
  candidate: JobCandidate;
  /** Line under the name (defaults to the headline). */
  detail?: ReactNode;
  /** Show the stage chip. */
  showStage?: boolean;
  /** Buttons on the right. */
  actions?: ReactNode;
  /** Extra content under the row (cover note, reasons…). */
  children?: ReactNode;
};

/** A caregiver in one of the job page lists. */
const CandidateRow = ({
  candidate,
  detail,
  showStage = false,
  actions,
  children,
}: CandidateRowProps) => {
  const stage = CANDIDATE_STAGE_META[candidate.stage];
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <CandidateAvatar name={candidate.name} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {candidate.name}
            </Typography>
            {candidate.verified ? (
              <Tooltip title="ID and documents verified">
                <VerifiedIcon
                  sx={{ fontSize: 16, color: "primary.main" }}
                  aria-label="Verified"
                />
              </Tooltip>
            ) : null}
            <RatingLabel
              rating={candidate.rating}
              reviews={candidate.reviews}
            />
            {showStage ? (
              <Chip
                label={stage.label}
                color={stage.color}
                size="small"
                variant={candidate.stage === "new" ? "filled" : "outlined"}
                sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
              />
            ) : null}
          </Stack>
          <Typography variant="caption" color="text.secondary" component="div">
            {detail ?? candidate.headline}
          </Typography>
        </Box>
        {actions ? (
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {actions}
          </Stack>
        ) : null}
      </Stack>
      {children ? <Box sx={{ pl: { xs: 0, sm: 6.5 } }}>{children}</Box> : null}
    </Stack>
  );
};

export default CandidateRow;
