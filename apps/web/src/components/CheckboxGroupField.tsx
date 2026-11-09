import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
} from "@mui/material";

type CheckboxOption<T extends string> = { value: T; label: string };

type CheckboxGroupFieldProps<T extends string> = {
  /** Used for error focusing (`data-field`). */
  name: string;
  label: string;
  options: CheckboxOption<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  /** Options that cannot be chosen here (e.g. already chosen in a sibling group). */
  disabledValues?: T[];
};

/**
 * Multi-select rendered as a responsive grid of checkboxes (one column on
 * phones, two on tablet+). Selection order is preserved.
 */
const CheckboxGroupField = <T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  disabledValues = [],
}: CheckboxGroupFieldProps<T>) => {
  const toggle = (option: T) => {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  };

  return (
    <FormControl
      component="fieldset"
      fullWidth
      required={required}
      disabled={disabled}
      error={Boolean(error)}
      data-field={name}
      tabIndex={-1}
      sx={{ outline: "none" }}
    >
      <FormLabel component="legend" sx={{ mb: 0.5 }}>
        {label}
      </FormLabel>
      <Box
        role="group"
        aria-label={label}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          columnGap: 2,
        }}
      >
        {options.map((option) => {
          const unavailable = disabledValues.includes(option.value);
          return (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={value.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  disabled={disabled || unavailable}
                  size="small"
                />
              }
              label={option.label}
              sx={{ mr: 0, alignItems: "flex-start", py: 0.25 }}
              slotProps={{ typography: { variant: "body2", sx: { pt: 0.9 } } }}
            />
          );
        })}
      </Box>
      {error || helperText ? (
        <FormHelperText>{error ?? helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
};

export default CheckboxGroupField;
