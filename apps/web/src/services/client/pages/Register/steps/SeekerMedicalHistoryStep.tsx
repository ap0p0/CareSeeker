import type { FormEvent } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  BASIC_CARE_NEED_OPTIONS,
  type BasicCareNeed,
  type OptionalDisclose,
  type SeekerMedicalHistory,
  type YesNo,
} from "../types";

type SeekerMedicalHistoryStepProps = {
  value: SeekerMedicalHistory;
  onChange: (next: SeekerMedicalHistory) => void;
  onContinue: () => Promise<void>;
  submitting?: boolean;
  error?: string | null;
};

const SeekerMedicalHistoryStep = ({
  value,
  onChange,
  onContinue,
  submitting = false,
  error = null,
}: SeekerMedicalHistoryStepProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const needsHelp = value.needsMedicalHelp === "yes";

  const update = <K extends keyof SeekerMedicalHistory>(
    field: K,
    fieldValue: SeekerMedicalHistory[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleNeedsMedicalHelpChange = (next: YesNo) => {
    if (next === "no") {
      onChange({
        ...value,
        needsMedicalHelp: "no",
        healthNotesChoice: "",
        healthNotes: "",
        medicationsChoice: "",
        medicationsNotes: "",
      });
      return;
    }

    update("needsMedicalHelp", next);
  };

  const includesOther = value.basicCareNeeds.includes("other");

  const toggleCareNeed = (need: BasicCareNeed) => {
    const selected = value.basicCareNeeds.includes(need)
      ? value.basicCareNeeds.filter((item) => item !== need)
      : [...value.basicCareNeeds, need];

    onChange({
      ...value,
      basicCareNeeds: selected,
      otherCareNeedDetails: selected.includes("other")
        ? value.otherCareNeedDetails
        : "",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!value.needsMedicalHelp) {
      setLocalError("Please answer whether you need medical support.");
      return;
    }

    if (value.basicCareNeeds.length === 0) {
      setLocalError("Please select at least one care need.");
      return;
    }

    if (includesOther && value.otherCareNeedDetails.trim().length === 0) {
      setLocalError("Please describe the other care need.");
      return;
    }

    await onContinue();
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit}>
      {localError || error ? (
        <Alert severity="error">{localError ?? error}</Alert>
      ) : null}

      <FormControl required disabled={submitting}>
        <FormLabel sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
          Will you need medical or health-related support?
        </FormLabel>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          For example help with appointments, monitoring symptoms, or everyday
          health routines.
        </Typography>
        <RadioGroup
          value={value.needsMedicalHelp}
          onChange={(event) =>
            handleNeedsMedicalHelpChange(event.target.value as YesNo)
          }
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>

      {needsHelp ? (
        <Stack spacing={3}>
          <Box>
            <FormControl disabled={submitting}>
              <FormLabel sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                Is there anything about your health a caregiver should know?
              </FormLabel>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Optional — share only what you are comfortable with.
              </Typography>
              <RadioGroup
                value={value.healthNotesChoice}
                onChange={(event) => {
                  const choice = event.target.value as OptionalDisclose;
                  onChange({
                    ...value,
                    healthNotesChoice: choice,
                    healthNotes:
                      choice === "prefer_not_to_say" ? "" : value.healthNotes,
                  });
                }}
              >
                <FormControlLabel
                  value="share"
                  control={<Radio />}
                  label="Yes, I would like to share"
                />
                <FormControlLabel
                  value="prefer_not_to_say"
                  control={<Radio />}
                  label="I prefer not to say"
                />
              </RadioGroup>
            </FormControl>

            {value.healthNotesChoice === "share" ? (
              <TextField
                sx={{ mt: 1.5 }}
                name="healthNotes"
                placeholder="Allergies, conditions, mobility needs, or anything helpful…"
                value={value.healthNotes}
                onChange={(event) => update("healthNotes", event.target.value)}
                fullWidth
                multiline
                minRows={3}
                disabled={submitting}
              />
            ) : null}
          </Box>

          <Box>
            <FormControl disabled={submitting}>
              <FormLabel sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}>
                Are you on any medications or a special care plan?
              </FormLabel>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Optional — this helps caregivers support you safely.
              </Typography>
              <RadioGroup
                value={value.medicationsChoice}
                onChange={(event) => {
                  const choice = event.target.value as OptionalDisclose;
                  onChange({
                    ...value,
                    medicationsChoice: choice,
                    medicationsNotes:
                      choice === "prefer_not_to_say"
                        ? ""
                        : value.medicationsNotes,
                  });
                }}
              >
                <FormControlLabel
                  value="share"
                  control={<Radio />}
                  label="Yes, I would like to share"
                />
                <FormControlLabel
                  value="prefer_not_to_say"
                  control={<Radio />}
                  label="I prefer not to say"
                />
              </RadioGroup>
            </FormControl>

            {value.medicationsChoice === "share" ? (
              <TextField
                sx={{ mt: 1.5 }}
                name="medicationsNotes"
                placeholder="List medications, dosages if useful, or treatment routines…"
                value={value.medicationsNotes}
                onChange={(event) =>
                  update("medicationsNotes", event.target.value)
                }
                fullWidth
                multiline
                minRows={3}
                disabled={submitting}
              />
            ) : null}
          </Box>
        </Stack>
      ) : null}

      <FormControl required component="fieldset" disabled={submitting}>
        <FormLabel
          component="legend"
          sx={{ mb: 0.5, fontWeight: 600, color: "text.primary" }}
        >
          What other needs will you request?
        </FormLabel>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Select all basic care needs that apply. You can add more jobs later.
        </Typography>
        <FormGroup>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 0.5,
            }}
          >
            {BASIC_CARE_NEED_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={value.basicCareNeeds.includes(option.value)}
                    onChange={() => toggleCareNeed(option.value)}
                    sx={{
                      color: (t) => t.palette.custom.blue,
                      "&.Mui-checked": {
                        color: (t) => t.palette.custom.blue,
                      },
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </Box>
        </FormGroup>

        {includesOther ? (
          <TextField
            sx={{ mt: 1.5 }}
            label="Please specify"
            name="otherCareNeedDetails"
            placeholder="Describe the other care need…"
            value={value.otherCareNeedDetails}
            onChange={(event) =>
              update("otherCareNeedDetails", event.target.value)
            }
            required
            fullWidth
            disabled={submitting}
          />
        ) : null}
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={!value.needsMedicalHelp || submitting}
        sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
      >
        {submitting ? "Saving..." : "Continue"}
      </Button>
    </Stack>
  );
};

export default SeekerMedicalHistoryStep;
