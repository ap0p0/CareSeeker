import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";

export type DescribedOption<T extends string> = {
  value: T;
  label: string;
  description: string;
};

type DescribedRadioGroupProps<T extends string> = {
  /** Input name; also used to focus the group on validation errors. */
  name: string;
  label: string;
  options: DescribedOption<T>[];
  value: T | "";
  onChange: (next: T) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

/** Single choice where every option has a short explanation underneath. */
const DescribedRadioGroup = <T extends string>({
  name,
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}: DescribedRadioGroupProps<T>) => (
  <FormControl
    component="fieldset"
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
    <RadioGroup
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio size="small" />}
          sx={{ alignItems: "flex-start", py: 0.25, mr: 0 }}
          label={
            <Stack sx={{ pt: 0.75 }}>
              <Typography variant="body2" fontWeight={600}>
                {option.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.description}
              </Typography>
            </Stack>
          }
        />
      ))}
    </RadioGroup>
    {error ? <FormHelperText>{error}</FormHelperText> : null}
  </FormControl>
);

export default DescribedRadioGroup;
