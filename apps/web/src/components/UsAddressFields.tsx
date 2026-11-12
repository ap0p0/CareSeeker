import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { UsAddressField, UsAddressForm } from "../utils/usAddress";
import { US_STATE_OPTIONS } from "../utils/usStates";

type UsAddressFieldsProps = {
  value: UsAddressForm;
  onChange: (field: UsAddressField, value: string) => void;
  errors?: Partial<Record<UsAddressField, string>>;
  disabled?: boolean;
  /** Prefix for element ids, so two address blocks can share a page. */
  idPrefix: string;
  /**
   * Browser autofill hints are only useful for the user's own address; pass
   * `false` when entering somebody else's.
   */
  autoFill?: boolean;
  /** `false`: city, state and ZIP only (e.g. a job post's location). */
  withStreet?: boolean;
};

/**
 * US-only structured address (street, city, state, ZIP). Field `name`s match
 * the API payload so validation errors can focus them.
 */
const UsAddressFields = ({
  value,
  onChange,
  errors = {},
  disabled = false,
  idPrefix,
  autoFill = true,
  withStreet = true,
}: UsAddressFieldsProps) => {
  const autoComplete = (hint: string) => (autoFill ? hint : "off");
  const stateLabelId = `${idPrefix}-state-label`;

  return (
    <Stack spacing={2}>
      {withStreet ? (
        <TextField
          name="addressLine1"
          label="Street address"
          autoComplete={autoComplete("address-line1")}
          value={value.addressLine1}
          onChange={(event) => onChange("addressLine1", event.target.value)}
          error={Boolean(errors.addressLine1)}
          helperText={errors.addressLine1}
          fullWidth
          disabled={disabled}
          required
        />
      ) : null}
      <TextField
        name="city"
        label="City"
        autoComplete={autoComplete("address-level2")}
        value={value.city}
        onChange={(event) => onChange("city", event.target.value)}
        error={Boolean(errors.city)}
        helperText={errors.city}
        fullWidth
        disabled={disabled}
        required
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <FormControl
          fullWidth
          required
          disabled={disabled}
          error={Boolean(errors.state)}
        >
          <InputLabel id={stateLabelId}>State</InputLabel>
          <Select
            labelId={stateLabelId}
            label="State"
            name="state"
            autoComplete={autoComplete("address-level1")}
            value={value.state}
            onChange={(event) => onChange("state", event.target.value)}
            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
          >
            {US_STATE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors.state ? (
            <FormHelperText>{errors.state}</FormHelperText>
          ) : null}
        </FormControl>
        <TextField
          name="postalCode"
          label="ZIP code"
          autoComplete={autoComplete("postal-code")}
          inputProps={{ inputMode: "numeric", maxLength: 10 }}
          value={value.postalCode}
          onChange={(event) => onChange("postalCode", event.target.value)}
          error={Boolean(errors.postalCode)}
          helperText={errors.postalCode}
          fullWidth
          disabled={disabled}
          required
        />
      </Stack>
    </Stack>
  );
};

export default UsAddressFields;
