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
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CARE_URGENCY_OPTIONS,
  ETHNIC_BACKGROUND_OPTIONS,
  HOME_ACCESSIBILITY_OPTIONS,
  LIVING_SITUATION_OPTIONS,
  PREFERRED_CAREGIVER_GENDER_OPTIONS,
  SCHEDULE_VIBE_OPTIONS,
  SPOKEN_LANGUAGE_OPTIONS,
  type CareUrgency,
  type EthnicBackground,
  type HomeAccessibility,
  type LivingSituation,
  type OptionalDisclose,
  type PreferredCaregiverGender,
  type ScheduleVibe,
  type SeekerAboutYouForm,
  type SpokenLanguage,
  type YesNo,
} from "../types";

type SeekerAboutYouStepProps = {
  value: SeekerAboutYouForm;
  onChange: (next: SeekerAboutYouForm) => void;
  onContinue: () => Promise<void>;
  submitting?: boolean;
  error?: string | null;
};

const SeekerAboutYouStep = ({
  value,
  onChange,
  onContinue,
  submitting = false,
  error = null,
}: SeekerAboutYouStepProps) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const livesWithSomeoneElse =
    Boolean(value.livingSituation) && value.livingSituation !== "live_alone";

  const update = <K extends keyof SeekerAboutYouForm>(
    field: K,
    fieldValue: SeekerAboutYouForm[K],
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleLivingSituationChange = (next: LivingSituation | "") => {
    onChange({
      ...value,
      livingSituation: next,
      needsHelpBesidesHousehold:
        next && next !== "live_alone" ? value.needsHelpBesidesHousehold : "",
    });
  };

  const toggleLanguage = (language: SpokenLanguage) => {
    const selected = value.languagesSpoken.includes(language)
      ? value.languagesSpoken.filter((item) => item !== language)
      : [...value.languagesSpoken, language];
    update("languagesSpoken", selected);
  };

  const toggleAccessibility = (item: HomeAccessibility) => {
    const selected = value.homeAccessibility.includes(item)
      ? value.homeAccessibility.filter((entry) => entry !== item)
      : [...value.homeAccessibility, item];
    update("homeAccessibility", selected);
  };

  const handleCulturalChoice = (choice: OptionalDisclose | "") => {
    if (choice !== "share") {
      onChange({
        ...value,
        culturalConsiderationsChoice: choice,
        culturalConsiderationsNotes: "",
      });
      return;
    }

    update("culturalConsiderationsChoice", choice);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    const age = Number(value.age);
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      setLocalError("Age must be a whole number between 18 and 120.");
      return;
    }

    if (!value.ethnicBackground) {
      setLocalError("Please select an ethnic background option.");
      return;
    }

    if (!value.location.trim()) {
      setLocalError("Please enter your location.");
      return;
    }

    if (value.languagesSpoken.length === 0) {
      setLocalError("Please select at least one language you speak.");
      return;
    }

    if (!value.livingSituation) {
      setLocalError("Please select your living situation.");
      return;
    }

    if (livesWithSomeoneElse && !value.needsHelpBesidesHousehold) {
      setLocalError(
        "Please tell us whether someone else besides you will need caregiver help.",
      );
      return;
    }

    if (!value.preferredCaregiverGender) {
      setLocalError("Please select a preferred caregiver gender.");
      return;
    }

    if (!value.preferredCaregiverLanguage) {
      setLocalError("Please select a preferred language with your caregiver.");
      return;
    }

    if (!value.scheduleVibe) {
      setLocalError("Please select a schedule preference.");
      return;
    }

    if (!value.careUrgency) {
      setLocalError("Please tell us how soon you need care.");
      return;
    }

    if (
      value.culturalConsiderationsChoice === "share" &&
      !value.culturalConsiderationsNotes.trim()
    ) {
      setLocalError(
        "Please share your cultural considerations, or choose prefer not to say.",
      );
      return;
    }

    await onContinue();
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
      {localError || error ? (
        <Alert severity="error">{localError ?? error}</Alert>
      ) : null}

      <TextField
        label="Age"
        name="age"
        type="number"
        inputProps={{ min: 18, max: 120 }}
        value={value.age}
        onChange={(event) => update("age", event.target.value)}
        required
        fullWidth
        disabled={submitting}
      />

      <FormControl fullWidth required disabled={submitting}>
        <InputLabel id="ethnic-background-label">Ethnic background</InputLabel>
        <Select
          labelId="ethnic-background-label"
          label="Ethnic background"
          value={value.ethnicBackground}
          onChange={(event) =>
            update(
              "ethnicBackground",
              event.target.value as EthnicBackground | "",
            )
          }
        >
          {ETHNIC_BACKGROUND_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Location"
        name="location"
        placeholder="City, state, or ZIP"
        value={value.location}
        onChange={(event) => update("location", event.target.value)}
        required
        fullWidth
        disabled={submitting}
        helperText="We’ll add map-based location later."
      />

      <Box>
        <FormLabel component="legend" required sx={{ mb: 1 }}>
          Languages you speak
        </FormLabel>
        <FormGroup>
          {SPOKEN_LANGUAGE_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={value.languagesSpoken.includes(option.value)}
                  onChange={() => toggleLanguage(option.value)}
                  disabled={submitting}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>
      </Box>

      <FormControl fullWidth required disabled={submitting}>
        <InputLabel id="living-situation-label">Living situation</InputLabel>
        <Select
          labelId="living-situation-label"
          label="Living situation"
          value={value.livingSituation}
          onChange={(event) =>
            handleLivingSituationChange(
              event.target.value as LivingSituation | "",
            )
          }
        >
          {LIVING_SITUATION_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {livesWithSomeoneElse ? (
        <FormControl disabled={submitting}>
          <FormLabel required>
            Does someone else besides you require help from the caregiver?
          </FormLabel>
          <RadioGroup
            value={value.needsHelpBesidesHousehold}
            onChange={(event) =>
              update("needsHelpBesidesHousehold", event.target.value as YesNo)
            }
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      ) : null}

      <FormControl fullWidth required disabled={submitting}>
        <InputLabel id="preferred-gender-label">
          Preferred caregiver gender
        </InputLabel>
        <Select
          labelId="preferred-gender-label"
          label="Preferred caregiver gender"
          value={value.preferredCaregiverGender}
          onChange={(event) =>
            update(
              "preferredCaregiverGender",
              event.target.value as PreferredCaregiverGender | "",
            )
          }
        >
          {PREFERRED_CAREGIVER_GENDER_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={submitting}>
        <InputLabel id="preferred-language-label">
          Preferred language with caregiver
        </InputLabel>
        <Select
          labelId="preferred-language-label"
          label="Preferred language with caregiver"
          value={value.preferredCaregiverLanguage}
          onChange={(event) =>
            update(
              "preferredCaregiverLanguage",
              event.target.value as SpokenLanguage | "",
            )
          }
        >
          {SPOKEN_LANGUAGE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl disabled={submitting}>
        <FormLabel>Religion / cultural considerations (optional)</FormLabel>
        <RadioGroup
          value={value.culturalConsiderationsChoice}
          onChange={(event) =>
            handleCulturalChoice(event.target.value as OptionalDisclose | "")
          }
        >
          <FormControlLabel
            value="share"
            control={<Radio />}
            label="I’d like to share"
          />
          <FormControlLabel
            value="prefer_not_to_say"
            control={<Radio />}
            label="Prefer not to say"
          />
        </RadioGroup>
        {value.culturalConsiderationsChoice === "share" ? (
          <TextField
            label="Cultural considerations"
            name="culturalConsiderationsNotes"
            value={value.culturalConsiderationsNotes}
            onChange={(event) =>
              update("culturalConsiderationsNotes", event.target.value)
            }
            fullWidth
            multiline
            minRows={2}
            disabled={submitting}
            sx={{ mt: 1 }}
          />
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          You can skip this if you’d rather not answer.
        </Typography>
      </FormControl>

      <FormControl fullWidth required disabled={submitting}>
        <InputLabel id="schedule-vibe-label">Schedule preference</InputLabel>
        <Select
          labelId="schedule-vibe-label"
          label="Schedule preference"
          value={value.scheduleVibe}
          onChange={(event) =>
            update("scheduleVibe", event.target.value as ScheduleVibe | "")
          }
        >
          {SCHEDULE_VIBE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <FormLabel component="legend" sx={{ mb: 1 }}>
          Accessibility at home (select all that apply)
        </FormLabel>
        <FormGroup>
          {HOME_ACCESSIBILITY_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={value.homeAccessibility.includes(option.value)}
                  onChange={() => toggleAccessibility(option.value)}
                  disabled={submitting}
                />
              }
              label={option.label}
            />
          ))}
        </FormGroup>
      </Box>

      <FormControl fullWidth required disabled={submitting}>
        <InputLabel id="care-urgency-label">
          How soon do you need care?
        </InputLabel>
        <Select
          labelId="care-urgency-label"
          label="How soon do you need care?"
          value={value.careUrgency}
          onChange={(event) =>
            update("careUrgency", event.target.value as CareUrgency | "")
          }
        >
          {CARE_URGENCY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        sx={{ borderRadius: 999, textTransform: "none", fontWeight: 700 }}
      >
        {submitting ? "Saving..." : "Continue"}
      </Button>
    </Stack>
  );
};

export default SeekerAboutYouStep;
