import { useMemo, useState } from "react";
import type { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  getDateOfBirthBounds,
  type DateOfBirthRules,
} from "../utils/dateOfBirth";

type DateOfBirthFieldProps = {
  value: Dayjs | null;
  onChange: (next: Dayjs | null) => void;
  rules: DateOfBirthRules;
  label?: string;
  /** Input `name`, used to focus the field on validation errors. */
  name?: string;
  error?: string;
  /** Shown when there is no error. */
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
};

/**
 * Date-of-birth picker: opens from the whole field (not only the icon),
 * starts at the year view and limits the selectable range to `rules`.
 */
const DateOfBirthField = ({
  value,
  onChange,
  rules,
  label = "Date of birth",
  name = "dateOfBirth",
  error,
  helperText,
  required = false,
  disabled = false,
}: DateOfBirthFieldProps) => {
  const [open, setOpen] = useState(false);
  const { minAge, maxAge } = rules;
  const bounds = useMemo(
    () => getDateOfBirthBounds({ minAge, maxAge }),
    [minAge, maxAge],
  );

  return (
    <DatePicker
      label={label}
      value={value}
      onChange={onChange}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      openTo="year"
      views={["year", "month", "day"]}
      minDate={bounds.min}
      maxDate={bounds.max}
      disabled={disabled}
      slotProps={{
        textField: {
          name,
          required,
          fullWidth: true,
          autoComplete: "bday",
          error: Boolean(error),
          helperText: error ?? helperText,
          onClick: () => {
            if (!disabled) setOpen(true);
          },
        },
      }}
    />
  );
};

export default DateOfBirthField;
