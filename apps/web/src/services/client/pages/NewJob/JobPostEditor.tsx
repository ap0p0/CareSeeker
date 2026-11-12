import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useBlocker, useNavigate } from "react-router-dom";
import UsAddressFields from "../../../../components/UsAddressFields";
import {
  useCreateJobMutation,
  useGenerateJobTextMutation,
  useUpdateClientJobMutation,
  type Job,
  type JobText,
} from "../../../../queries/client";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../../routes/enums";
import { focusFirstInvalidField } from "../../../../utils/focusField";
import type { UsAddressField } from "../../../../utils/usAddress";
import CareNeedsFields from "../../components/CareNeedsFields";
import type { CarePreferencesErrors } from "../Register/carePreferencesForm";
import DiscardJobPostDialog from "./DiscardJobPostDialog";
import {
  hasPastVisitDate,
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_POST_FIELD_ORDER,
  JOB_TITLE_MAX_LENGTH,
  toCreateJobPayload,
  toJobTextPayload,
  validateJobPost,
  type JobPostErrors,
  type JobPostForm,
  type JobPostValidation,
} from "./jobPostForm";
import { jobPath } from "../Job/jobLinks";
import { newJobPath, type JobStartMode } from "./jobStartMode";

/** Path of the open jobs list (where editing returns). */
const OPEN_JOBS_PATH = SEEKER_ROUTE_PATHS[SeekerRoute.Jobs];

type TextStatus =
  | { severity: "success"; message: string; previous: JobText }
  | { severity: "warning" | "error"; message: string };

const pillButton = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
} as const;

const cardSx = {
  p: { xs: 2.5, md: 3 },
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
} as const;

/** A titled card of the job post form. */
const Section = ({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) => (
  <Paper elevation={0} component="section" aria-labelledby={id} sx={cardSx}>
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography id={id} variant="h6" component="h2" fontWeight={700}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Stack>
      {children}
    </Stack>
  </Paper>
);

const errorMessage = (caught: unknown, fallback: string): string =>
  caught instanceof Error ? caught.message : fallback;

/** What the editor is for: a new post, or changing an existing one. */
export type JobPostEditorIntent =
  | {
      kind: "create";
      /** How the post was started, for the page copy. */
      mode: JobStartMode;
      /** The form was prefilled from the account (prefill + data found). */
      prefilled: boolean;
    }
  | {
      kind: "edit";
      jobId: string;
      /** Where saving / discarding returns (default: the open jobs list). */
      returnTo?: string;
    };

type JobPostEditorProps = {
  /** What the form starts with (prefilled draft, empty, or the saved job). */
  initialForm: JobPostForm;
  intent: JobPostEditorIntent;
  /** First name of the person receiving care, for the copy. */
  recipientName?: string;
};

/**
 * The job post form — `/jobs/new` (whatever it starts from) and
 * `/jobs/:jobId/edit` (open jobs only; the page checks). Title,
 * description, location (no street address) and the care details (the
 * registration step 3 questions). "Rewrite from the details" asks the API
 * for a new title and description from the current details. Nothing is
 * saved until "Submit job"; the profile is never changed from here.
 * "Cancel" — and leaving with unsaved changes, including back to the
 * "how to start" choice — asks before the post (or the edits) are thrown
 * away. Editing returns to the open jobs list with a confirmation.
 */
const JobPostEditor = ({
  initialForm,
  intent,
  recipientName,
}: JobPostEditorProps) => {
  const navigate = useNavigate();
  const editing = intent.kind === "edit";
  const editReturnPath =
    intent.kind === "edit"
      ? (intent.returnTo ?? OPEN_JOBS_PATH)
      : OPEN_JOBS_PATH;
  const prefilled = intent.kind === "create" && intent.prefilled;
  const createMutation = useCreateJobMutation();
  const updateMutation = useUpdateClientJobMutation();
  const textMutation = useGenerateJobTextMutation();

  const [edits, setEdits] = useState<JobPostForm | null>(null);
  const [postErrors, setPostErrors] = useState<JobPostErrors>({});
  const [detailErrors, setDetailErrors] = useState<CarePreferencesErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [textStatus, setTextStatus] = useState<TextStatus | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [postedJob, setPostedJob] = useState<Job | null>(null);
  /** Set right before leaving on purpose, so the guard lets it through. */
  const leavingRef = useRef(false);

  const form = edits ?? initialForm;
  const hasUnsavedChanges = edits !== null && postedJob === null;

  // In-app navigation away from unsaved changes asks first (signing out
  // is an explicit choice and is let through).
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      !leavingRef.current &&
      // The mode lives in the query string: `?mode=…` → `/jobs/new` leaves too.
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search) &&
      nextLocation.pathname !== SEEKER_ROUTE_PATHS[SeekerRoute.Login],
  );

  // Closing / reloading the tab: the browser's own confirmation.
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);

  const submitting = createMutation.isPending || updateMutation.isPending;
  const rewriting = textMutation.isPending;
  const hasText = Boolean(form.title.trim() || form.description.trim());

  const update = (next: JobPostForm) => {
    setEdits(next);
    setSubmitError(null);
  };

  const updatePostField = (field: keyof JobPostErrors, value: string) => {
    update({ ...form, [field]: value });
    if (postErrors[field]) {
      const next = { ...postErrors };
      delete next[field];
      setPostErrors(next);
    }
  };

  const showErrors = (validation: JobPostValidation) => {
    setPostErrors(validation.post);
    setDetailErrors(validation.details);
    focusFirstInvalidField(JOB_POST_FIELD_ORDER, {
      ...validation.post,
      ...validation.details,
    });
  };

  const handleRewrite = async () => {
    setTextStatus(null);
    const validation = validateJobPost(form, { withText: false });
    if (!validation.valid) {
      showErrors(validation);
      setTextStatus({
        severity: "warning",
        message:
          "Please complete the highlighted details first, then try again.",
      });
      return;
    }

    const previous = { title: form.title, description: form.description };
    try {
      const text = await textMutation.mutateAsync(toJobTextPayload(form));
      // The text fields are disabled meanwhile; keep any other edits.
      setEdits((current) => ({ ...(current ?? form), ...text }));
      setPostErrors((current) => {
        const next = { ...current };
        delete next.title;
        delete next.description;
        return next;
      });
      setTextStatus({
        severity: "success",
        message: `The title and description were ${
          previous.title.trim() || previous.description.trim()
            ? "rewritten"
            : "written"
        } from the details.`,
        previous,
      });
    } catch (caught) {
      setTextStatus({
        severity: "error",
        message: errorMessage(
          caught,
          "Could not write a new title and description. Please try again.",
        ),
      });
    }
  };

  const undoRewrite = (previous: JobText) => {
    setEdits((current) => ({ ...(current ?? form), ...previous }));
    setTextStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    const validation = validateJobPost(form, { withText: true });
    if (!validation.valid) {
      showErrors(validation);
      return;
    }

    try {
      const payload = toCreateJobPayload(form);
      if (intent.kind === "edit") {
        await updateMutation.mutateAsync({ jobId: intent.jobId, payload });
        leaveTo(editReturnPath, {
          flash: `Your changes to “${payload.title}” were saved.`,
        });
        return;
      }
      const job = await createMutation.mutateAsync(payload);
      setPostedJob(job);
      window.scrollTo({ top: 0 });
    } catch (caught) {
      setSubmitError(
        errorMessage(
          caught,
          editing
            ? "Could not save your changes. Please try again."
            : "Could not post your job. Please try again.",
        ),
      );
    }
  };

  /** Leaves on purpose (no "discard?" question); replaces this entry. */
  const leaveTo = (path: string, state?: { flash: string }) => {
    leavingRef.current = true;
    navigate(path, { replace: true, state });
  };

  const keepEditing = () => {
    setConfirmingCancel(false);
    if (blocker.state === "blocked") blocker.reset();
  };

  const discard = () => {
    setConfirmingCancel(false);
    leavingRef.current = true;
    if (blocker.state === "blocked") {
      blocker.proceed();
    } else {
      leaveTo(
        editing ? editReturnPath : SEEKER_ROUTE_PATHS[SeekerRoute.Dashboard],
      );
    }
  };

  /** Back to the "how do you want to start?" choice (guarded when dirty). */
  const changeStart = () => navigate(newJobPath());

  if (postedJob) {
    return (
      <Paper elevation={0} sx={{ ...cardSx, maxWidth: 960 }} role="status">
        <Stack spacing={2} alignItems="flex-start">
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48 }} />
          <Typography variant="h4" component="h1" fontWeight={700}>
            Your job is posted
          </Typography>
          <Typography color="text.secondary">
            “{postedJob.title}” is saved and open.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              size="large"
              onClick={() => leaveTo(jobPath(postedJob.jobId))}
              sx={pillButton}
            >
              View job
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => leaveTo(SEEKER_ROUTE_PATHS[SeekerRoute.Jobs])}
              sx={pillButton}
            >
              Open jobs
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={changeStart}
              sx={pillButton}
            >
              Post another job
            </Button>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      sx={{ maxWidth: 960 }}
    >
      <Paper elevation={0} sx={cardSx}>
        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Chip
              label={
                editing
                  ? "Editing an open job"
                  : prefilled
                    ? "Prefilled from your account"
                    : "New job post"
              }
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
            {editing ? null : (
              <Button
                size="small"
                startIcon={<SwapHorizIcon />}
                onClick={changeStart}
                disabled={submitting}
                sx={{ textTransform: "none", flexShrink: 0 }}
              >
                Start differently
              </Button>
            )}
          </Stack>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {editing ? "Edit job post" : "Create your job post"}
          </Typography>
          <Typography color="text.secondary">
            {editing
              ? "Change the requirements while the job is still open — once you start interviewing, they are locked. Nothing changes until you save."
              : prefilled
                ? `We prefilled this job post with what you told us${
                    recipientName ? ` about ${recipientName}` : ""
                  } during registration. Check everything, change what you like, then submit the job.`
                : intent.kind === "create" && intent.mode === "prefill"
                  ? "There is nothing saved in your account to prefill this job post with yet. Describe the help you need, then submit the job."
                  : "Describe the help you need, then submit the job."}
          </Typography>
        </Stack>
      </Paper>

      {prefilled ? (
        <Alert severity="info">
          Changes you make here only apply to this job post — your saved
          registration details stay as they are.
        </Alert>
      ) : null}
      {hasPastVisitDate(form) ? (
        <Alert severity="warning">
          {editing
            ? "The visit date has already passed."
            : "The visit date from your registration has already passed."}{" "}
          Please pick a new date under “When is the visit?”.
        </Alert>
      ) : null}

      <Section
        id="job-text-heading"
        title="Title & description"
        description={
          prefilled
            ? "This is what caregivers read first. We wrote it from your answers — make it your own."
            : "This is what caregivers read first."
        }
      >
        <TextField
          name="title"
          label="Job title"
          value={form.title}
          onChange={(event) => updatePostField("title", event.target.value)}
          error={Boolean(postErrors.title)}
          helperText={
            postErrors.title ?? `${form.title.length} / ${JOB_TITLE_MAX_LENGTH}`
          }
          inputProps={{ maxLength: JOB_TITLE_MAX_LENGTH }}
          disabled={submitting || rewriting}
          required
          fullWidth
        />
        <TextField
          name="description"
          label="Short description"
          value={form.description}
          onChange={(event) =>
            updatePostField("description", event.target.value)
          }
          error={Boolean(postErrors.description)}
          helperText={
            postErrors.description ??
            `${form.description.length} / ${JOB_DESCRIPTION_MAX_LENGTH}`
          }
          inputProps={{ maxLength: JOB_DESCRIPTION_MAX_LENGTH }}
          disabled={submitting || rewriting}
          multiline
          minRows={5}
          required
          fullWidth
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
        >
          <Button
            variant="outlined"
            onClick={() => void handleRewrite()}
            disabled={submitting || rewriting}
            startIcon={
              rewriting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AutoAwesomeOutlinedIcon />
              )
            }
            sx={{ ...pillButton, flexShrink: 0, alignSelf: "flex-start" }}
          >
            {hasText ? "Rewrite from the details" : "Write from the details"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            {hasText
              ? "Changed the details below? Replace the title and description with a new version written from them."
              : "Fill in the location and care details below, then let us write a title and description for you."}
          </Typography>
        </Stack>
        {textStatus ? (
          <Alert
            severity={textStatus.severity}
            onClose={() => setTextStatus(null)}
            action={
              textStatus.severity === "success" ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => undoRewrite(textStatus.previous)}
                >
                  Undo
                </Button>
              ) : undefined
            }
          >
            {textStatus.message}
          </Alert>
        ) : null}
      </Section>

      <Section
        id="job-location-heading"
        title="Location"
        description="Where care takes place. Only the city, state and ZIP code are part of the job post — never the street address."
      >
        <UsAddressFields
          idPrefix="job-location"
          withStreet={false}
          autoFill={false}
          value={{ ...form, addressLine1: "" }}
          onChange={(field: UsAddressField, value: string) => {
            if (field !== "addressLine1") updatePostField(field, value);
          }}
          errors={postErrors}
          disabled={submitting}
        />
      </Section>

      <Section
        id="job-details-heading"
        title="Care details"
        description={
          <>
            What the job involves. Fields marked with{" "}
            <Typography component="span" color="error.main" fontWeight={700}>
              *
            </Typography>{" "}
            are required.
          </>
        }
      >
        <CareNeedsFields
          value={form.details}
          onChange={(details) => update({ ...form, details })}
          errors={detailErrors}
          onErrorsChange={setDetailErrors}
          disabled={submitting}
          recipientName={recipientName}
        />
      </Section>

      <Paper elevation={0} sx={cardSx}>
        <Stack spacing={2}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              {editing
                ? "Saving updates the job post. Cancel keeps the job as it was."
                : "Submitting opens the job. Cancel deletes this job post."}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", sm: "row" },
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => setConfirmingCancel(true)}
                disabled={submitting}
                sx={pillButton}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting || rewriting}
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : editing ? (
                    <SaveOutlinedIcon />
                  ) : (
                    <SendOutlinedIcon />
                  )
                }
                sx={pillButton}
              >
                {editing
                  ? submitting
                    ? "Saving…"
                    : "Save changes"
                  : submitting
                    ? "Submitting…"
                    : "Submit job"}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <DiscardJobPostDialog
        variant={editing ? "edit" : "create"}
        open={confirmingCancel || blocker.state === "blocked"}
        onKeepEditing={keepEditing}
        onDiscard={discard}
      />
    </Stack>
  );
};

export default JobPostEditor;
