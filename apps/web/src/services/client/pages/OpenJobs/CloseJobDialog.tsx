import type { FormEvent } from "react";
import { useState } from "react";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import {
  CLOSURE_EXPLANATION_MAX_LENGTH,
  CLOSURE_EXPLANATION_MIN_LENGTH,
  JOB_CLOSURE_REASONS,
  canResumeJob,
  closureCompensationRisk,
  closureRequestsAvailable,
  jobClosurePolicy,
  useCloseClientJobMutation,
  useRequestJobClosureMutation,
  useResumeClientJobMutation,
  type ClientJobOverview,
  type JobClosureReason,
} from "../../../../queries/client";

type CloseJobDialogProps = {
  job: ClientJobOverview;
  onClose: () => void;
  /** After closing / requesting, with a confirmation for the page. */
  onDone: (message: string) => void;
};

const pillButton = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
} as const;

const COMPENSATION_NOTE = {
  interviewing:
    "You are interviewing candidates for this job (or waiting for an answer to an offer). Closing it now may lead them to ask for compensation for their time.",
  hired:
    "A caregiver is hired for this job. Closing it early may lead them to ask for compensation — for example for hours already worked, visits that were scheduled, or a notice period.",
} as const;

/**
 * "Close job" from a card. Open jobs close right away (they move to the
 * archive). Any other running job needs a reason and an admin's approval;
 * when candidates are interviewing or a caregiver is hired, the seeker is
 * warned that compensation may be asked and has to acknowledge it.
 */
const CloseJobDialog = ({ job, onClose, onDone }: CloseJobDialogProps) => {
  const closeMutation = useCloseClientJobMutation();
  const requestMutation = useRequestJobClosureMutation();
  const resumeMutation = useResumeClientJobMutation();
  const policy = jobClosurePolicy(job);
  const risk = closureCompensationRisk(job);
  const reasons = JOB_CLOSURE_REASONS.filter(
    (option) => !option.hiredOnly || job.status === "hired",
  );

  const [reason, setReason] = useState<JobClosureReason | "">("");
  const [explanation, setExplanation] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<{
    reason?: string;
    explanation?: string;
    acknowledged?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const pending =
    closeMutation.isPending ||
    requestMutation.isPending ||
    resumeMutation.isPending;

  const fail = (caught: unknown) =>
    setSubmitError(
      caught instanceof Error
        ? caught.message
        : "Something went wrong. Please try again.",
    );

  const closeNow = async () => {
    setSubmitError(null);
    try {
      await closeMutation.mutateAsync({ jobId: job.jobId });
      onDone(`“${job.title}” was closed and moved to your archive.`);
    } catch (caught) {
      fail(caught);
    }
  };

  const sendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const next: typeof errors = {};
    if (!reason) next.reason = "Please choose a reason.";
    const text = explanation.trim();
    if (text.length < CLOSURE_EXPLANATION_MIN_LENGTH) {
      next.explanation = `Please explain in a few words (at least ${CLOSURE_EXPLANATION_MIN_LENGTH} characters).`;
    }
    if (risk && !acknowledged) {
      next.acknowledged = "Please confirm you have read this.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0 || !reason) return;

    try {
      await requestMutation.mutateAsync({
        jobId: job.jobId,
        reason,
        explanation: text,
      });
      onDone(
        `Your request to close “${job.title}” was sent. An admin will review it.`,
      );
    } catch (caught) {
      fail(caught);
    }
  };

  // Finished, or a request is already waiting: the card offers no close.
  if (policy === "not_allowed") return null;

  // Real jobs: admin approval does not exist yet. A paused job can be
  // resumed, and then closed right away.
  if (policy === "request_approval" && !closureRequestsAvailable()) {
    const resume = async () => {
      setSubmitError(null);
      try {
        await resumeMutation.mutateAsync({ jobId: job.jobId });
        onDone(`“${job.title}” is open again — you can close it now.`);
      } catch (caught) {
        fail(caught);
      }
    };
    return (
      <Dialog
        open
        onClose={pending ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="close-job-title"
      >
        <DialogTitle id="close-job-title" sx={{ fontWeight: 700 }}>
          This job can’t be closed yet
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <DialogContentText>
              Only open jobs can be closed right away. Closing “{job.title}” now
              would need an admin’s approval, which is not available yet.
            </DialogContentText>
            {canResumeJob(job) ? (
              <DialogContentText>
                Resume the job first, then close it.
              </DialogContentText>
            ) : null}
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
          <Button onClick={onClose} disabled={pending} sx={pillButton}>
            OK
          </Button>
          {canResumeJob(job) ? (
            <Button
              variant="contained"
              onClick={() => void resume()}
              disabled={pending}
              startIcon={
                pending ? <CircularProgress size={18} color="inherit" /> : null
              }
              sx={pillButton}
            >
              Resume job
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    );
  }

  if (policy === "close_now") {
    return (
      <Dialog
        open
        onClose={pending ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        aria-labelledby="close-job-title"
      >
        <DialogTitle id="close-job-title" sx={{ fontWeight: 700 }}>
          Close this job?
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <DialogContentText>
              “{job.title}” moves to your archive. Caregivers can no longer find
              it or apply.
            </DialogContentText>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
          <Button onClick={onClose} disabled={pending} sx={pillButton}>
            Keep job open
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void closeNow()}
            disabled={pending}
            startIcon={
              pending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <ArchiveOutlinedIcon />
              )
            }
            sx={pillButton}
          >
            Close job
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open
      onClose={pending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="request-closure-title"
      PaperProps={{
        component: "form",
        onSubmit: (event: FormEvent<HTMLFormElement>) =>
          void sendRequest(event),
        noValidate: true,
      }}
    >
      <DialogTitle id="request-closure-title" sx={{ fontWeight: 700 }}>
        Request to close this job
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <DialogContentText>
            “{job.title}” is past the open stage, so it can only be closed with
            a reason and an admin’s approval. Until then the job keeps running
            as it is.
          </DialogContentText>

          {risk ? (
            <Alert severity="warning">
              <strong>Compensation may be requested.</strong>{" "}
              {COMPENSATION_NOTE[risk]}
            </Alert>
          ) : null}

          <FormControl error={Boolean(errors.reason)} required>
            <FormLabel id="closure-reason-label">
              Why do you want to close it?
            </FormLabel>
            <RadioGroup
              aria-labelledby="closure-reason-label"
              name="closureReason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value as JobClosureReason);
                setErrors((current) => ({ ...current, reason: undefined }));
              }}
            >
              {reasons.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                  disabled={pending}
                />
              ))}
            </RadioGroup>
            {errors.reason ? (
              <FormHelperText>{errors.reason}</FormHelperText>
            ) : null}
          </FormControl>

          <TextField
            name="closureExplanation"
            label="Tell us a bit more"
            placeholder="What happened, and is there anything the admin should know?"
            value={explanation}
            onChange={(event) => {
              setExplanation(event.target.value);
              setErrors((current) => ({ ...current, explanation: undefined }));
            }}
            error={Boolean(errors.explanation)}
            helperText={
              errors.explanation ??
              `${explanation.length} / ${CLOSURE_EXPLANATION_MAX_LENGTH}`
            }
            inputProps={{ maxLength: CLOSURE_EXPLANATION_MAX_LENGTH }}
            multiline
            minRows={3}
            required
            fullWidth
            disabled={pending}
          />

          {risk ? (
            <FormControl error={Boolean(errors.acknowledged)}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="compensationAcknowledged"
                    checked={acknowledged}
                    onChange={(event) => {
                      setAcknowledged(event.target.checked);
                      setErrors((current) => ({
                        ...current,
                        acknowledged: undefined,
                      }));
                    }}
                    disabled={pending}
                  />
                }
                label="I understand that a payment compensation may be asked."
              />
              {errors.acknowledged ? (
                <FormHelperText>{errors.acknowledged}</FormHelperText>
              ) : null}
            </FormControl>
          ) : null}

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={onClose} disabled={pending} sx={pillButton}>
          Keep job running
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={pending}
          startIcon={
            pending ? <CircularProgress size={18} color="inherit" /> : null
          }
          sx={pillButton}
        >
          Send request
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseJobDialog;
