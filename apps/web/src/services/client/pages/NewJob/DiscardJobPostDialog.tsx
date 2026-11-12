import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

type DiscardJobPostDialogProps = {
  /** `edit`: only the unsaved changes are lost; the job stays as it was. */
  variant?: "create" | "edit";
  open: boolean;
  /** Stay on the page; nothing is lost. */
  onKeepEditing: () => void;
  /** Throw the job post away and leave the page. */
  onDiscard: () => void;
};

/**
 * Shown before a job post being written is thrown away — on "Cancel" and
 * when leaving the page with unsaved changes. Makes clear what is lost: the
 * new post (registration details stay saved), or only the unsaved edits.
 */
const COPY = {
  create: {
    title: "Delete this job post?",
    body: "Everything you entered for this job post will be deleted and the job will not be posted. This cannot be undone.",
    note: "Your registration details are not affected.",
    confirm: "Delete job post",
  },
  edit: {
    title: "Discard your changes?",
    body: "The changes you made will be lost. The job stays exactly as it was before you started editing.",
    note: null,
    confirm: "Discard changes",
  },
} as const;

const DiscardJobPostDialog = ({
  variant = "create",
  open,
  onKeepEditing,
  onDiscard,
}: DiscardJobPostDialogProps) => {
  const copy = COPY[variant];
  return (
    <Dialog
      open={open}
      onClose={onKeepEditing}
      aria-labelledby="discard-job-post-title"
      aria-describedby="discard-job-post-description"
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle id="discard-job-post-title" sx={{ fontWeight: 700 }}>
        {copy.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="discard-job-post-description">
          {copy.body}
        </DialogContentText>
        {copy.note ? (
          <DialogContentText sx={{ mt: 1.5 }}>{copy.note}</DialogContentText>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, flexWrap: "wrap" }}>
        <Button
          onClick={onKeepEditing}
          autoFocus
          sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
        >
          Keep editing
        </Button>
        <Button
          onClick={onDiscard}
          color="error"
          variant="contained"
          startIcon={<DeleteOutlineIcon />}
          sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
        >
          {copy.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscardJobPostDialog;
