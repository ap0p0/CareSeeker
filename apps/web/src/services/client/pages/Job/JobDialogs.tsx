import type { FormEvent } from "react";
import { useState } from "react";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Stack,
  TextField,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  usePauseClientJobMutation,
  useUpdateClientJobMutation,
  type ClientJobOverview,
} from "../../../../queries/client";
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  JOB_TITLE_MAX_LENGTH,
  jobPostFormFromDraft,
  toCreateJobPayload,
  validateJobText,
  type JobPostErrors,
} from "../NewJob/jobPostForm";
import { editJobPath, jobPath } from "./jobLinks";

const pill = {
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
} as const;

const errorText = (caught: unknown) =>
  caught instanceof Error
    ? caught.message
    : "Something went wrong. Please try again.";

type DialogProps = {
  job: ClientJobOverview;
  onClose: () => void;
  /** Done, with a confirmation for the page. */
  onDone: (message: string) => void;
};

/**
 * Quick edit on the job page: the title and description, right there.
 * The requirements (schedule, tasks, budget…) stay in the full form,
 * linked from here. Open jobs only (the page only offers it then, and the
 * mock service refuses otherwise).
 */
export const QuickEditDialog = ({ job, onClose, onDone }: DialogProps) => {
  const updateMutation = useUpdateClientJobMutation();
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [errors, setErrors] = useState<JobPostErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const saving = updateMutation.isPending;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError(null);
    const next = validateJobText({ title, description });
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      const payload = toCreateJobPayload({
        ...jobPostFormFromDraft(job),
        title,
        description,
      });
      await updateMutation.mutateAsync({ jobId: job.jobId, payload });
      onDone("Your changes were saved.");
    } catch (caught) {
      setSaveError(errorText(caught));
    }
  };

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="quick-edit-title"
      PaperProps={{
        component: "form",
        onSubmit: (event: FormEvent<HTMLFormElement>) => void save(event),
        noValidate: true,
      }}
    >
      <DialogTitle id="quick-edit-title" sx={{ fontWeight: 700 }}>
        Quick edit
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            name="title"
            label="Job title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setErrors((current) => ({ ...current, title: undefined }));
            }}
            error={Boolean(errors.title)}
            helperText={
              errors.title ?? `${title.length} / ${JOB_TITLE_MAX_LENGTH}`
            }
            inputProps={{ maxLength: JOB_TITLE_MAX_LENGTH }}
            disabled={saving}
            required
            fullWidth
            autoFocus
          />
          <TextField
            name="description"
            label="Short description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setErrors((current) => ({ ...current, description: undefined }));
            }}
            error={Boolean(errors.description)}
            helperText={
              errors.description ??
              `${description.length} / ${JOB_DESCRIPTION_MAX_LENGTH}`
            }
            inputProps={{ maxLength: JOB_DESCRIPTION_MAX_LENGTH }}
            disabled={saving}
            multiline
            minRows={5}
            required
            fullWidth
          />
          <DialogContentText variant="body2">
            Need to change the schedule, tasks, budget or caregiver preferences?{" "}
            <Link
              component={RouterLink}
              to={editJobPath(job.jobId)}
              state={{ returnTo: jobPath(job.jobId) }}
              fontWeight={600}
            >
              Edit all requirements
            </Link>
          </DialogContentText>
          {saveError ? <Alert severity="error">{saveError}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={saving} sx={pill}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={pill}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/** "Pause job": hides an open job from caregivers until it is resumed. */
export const PauseJobDialog = ({ job, onClose, onDone }: DialogProps) => {
  const pauseMutation = usePauseClientJobMutation();
  const [error, setError] = useState<string | null>(null);
  const pausing = pauseMutation.isPending;

  const pause = async () => {
    setError(null);
    try {
      await pauseMutation.mutateAsync({ jobId: job.jobId });
      onDone(`“${job.title}” is paused.`);
    } catch (caught) {
      setError(errorText(caught));
    }
  };

  return (
    <Dialog
      open
      onClose={pausing ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="pause-job-title"
    >
      <DialogTitle id="pause-job-title" sx={{ fontWeight: 700 }}>
        Pause this job?
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <DialogContentText>
            Caregivers can no longer find the job or apply, and we stop
            suggesting it. Applications you already received stay, and you can
            resume the job at any time.
          </DialogContentText>
          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
        <Button onClick={onClose} disabled={pausing} sx={pill}>
          Keep job open
        </Button>
        <Button
          variant="contained"
          onClick={() => void pause()}
          disabled={pausing}
          startIcon={
            pausing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PauseCircleOutlineIcon />
            )
          }
          sx={pill}
        >
          Pause job
        </Button>
      </DialogActions>
    </Dialog>
  );
};
