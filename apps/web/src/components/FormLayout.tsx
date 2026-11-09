import type { ReactNode } from "react";
import {
  Box,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

/**
 * Layout primitives shared by the multi-step registration forms (provider
 * onboarding and client registration), so every step looks the same.
 */

/** Titled group of fields. */
export const FormSection = ({
  title,
  description,
  children,
  spacing = 2,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Gap between the fields of the section. */
  spacing?: number;
}) => (
  <Stack spacing={spacing}>
    <Stack spacing={0.25}>
      <Typography variant="subtitle1" component="h2" fontWeight={700}>
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
);

/** Two fields side by side on tablet+, stacked on phones. */
export const FieldRow = ({ children }: { children: ReactNode }) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
    {children}
  </Stack>
);

/** Yes / no option as a switch with a label and an optional hint. */
export const SwitchRow = ({
  label,
  hint,
  checked,
  onChange,
  disabled,
  name,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled: boolean;
  /** Input name, for tests / error focusing. */
  name?: string;
}) => (
  <FormControlLabel
    control={
      <Switch
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
    }
    label={
      <Box>
        <Typography variant="body2">{label}</Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </Box>
    }
    sx={{ alignItems: "flex-start", ml: 0, "& .MuiSwitch-root": { mt: -0.5 } }}
  />
);
