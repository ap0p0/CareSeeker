import type { FormEvent } from "react";
import { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { focusFirstInvalidField } from "../../../../../utils/focusField";
import CareNeedsFields, {
  CARE_NEEDS_FIELD_ORDER,
} from "../../../components/CareNeedsFields";
import type {
  CarePreferencesErrors,
  CarePreferencesForm,
} from "../carePreferencesForm";
import { validateCarePreferences } from "../validation";

type CareNeedsStepProps = {
  value: CarePreferencesForm;
  onChange: (next: CarePreferencesForm) => void;
  /** Called once the step validates; the page saves it. */
  onSubmit: () => Promise<void>;
  submitting: boolean;
  /** Server / flow error shown above the form. */
  error: string | null;
  /** Success message (when editing a saved step). */
  statusMessage?: string | null;
  submitLabel?: string;
  /** First name of the person receiving care, to personalize the copy. */
  recipientName?: string;
  /** Some answers were pre-filled from step 2 (nothing saved yet). */
  prefilled?: boolean;
};

/**
 * Registering on behalf of someone else — step 3: care needs & assistance
 * preferences (the questions are `CareNeedsFields`). Validates on submit,
 * then lets the page save.
 */
const CareNeedsStep = ({
  value,
  onChange,
  onSubmit,
  submitting,
  error,
  statusMessage = null,
  submitLabel = "Save & continue",
  recipientName,
  prefilled = false,
}: CareNeedsStepProps) => {
  const [fieldErrors, setFieldErrors] = useState<CarePreferencesErrors>({});
  const name = recipientName?.trim() || null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateCarePreferences(value);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      focusFirstInvalidField(CARE_NEEDS_FIELD_ORDER, errors);
      return;
    }

    await onSubmit();
  };

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
    >
      {statusMessage ? <Alert severity="success">{statusMessage}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {prefilled ? (
        <Alert severity="info">
          We pre-filled a few answers from what you told us about{" "}
          {name ?? "them"}. Please review and adjust them.
        </Alert>
      ) : null}

      <Typography variant="body2" color="text.secondary">
        Fields marked with{" "}
        <Typography component="span" color="error.main" fontWeight={700}>
          *
        </Typography>{" "}
        are required.
      </Typography>

      <CareNeedsFields
        value={value}
        onChange={onChange}
        errors={fieldErrors}
        onErrorsChange={setFieldErrors}
        disabled={submitting}
        recipientName={recipientName}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        startIcon={
          submitting ? <CircularProgress size={18} color="inherit" /> : null
        }
        sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
      >
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </Stack>
  );
};

export default CareNeedsStep;
