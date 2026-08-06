import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { VerificationFilter } from "./utils";
import { VERIFICATION_FILTER_ALL } from "./utils";

type VerificationFilterProps = {
  value: VerificationFilter;
  onChange: (v: VerificationFilter) => void;
};

const VerificationFilterControl = ({
  value,
  onChange,
}: VerificationFilterProps) => {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="provider-verification-filter">Verification</InputLabel>
      <Select
        labelId="provider-verification-filter"
        label="Verification"
        value={value}
        onChange={(e) => onChange(e.target.value as VerificationFilter)}
      >
        <MenuItem value={VERIFICATION_FILTER_ALL}>All</MenuItem>
        <MenuItem value="verified">Verified</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="rejected">Rejected</MenuItem>
      </Select>
    </FormControl>
  );
};

export default VerificationFilterControl;
