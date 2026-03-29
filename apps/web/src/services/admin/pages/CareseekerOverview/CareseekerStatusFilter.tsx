import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { CareseekerStatusFilter } from "./utils";
import { STATUS_FILTER_ALL } from "./utils";

type CareseekerStatusFilterProps = {
  value: CareseekerStatusFilter;
  onChange: (v: CareseekerStatusFilter) => void;
};

const CareseekerStatusFilterControl = ({
  value,
  onChange,
}: CareseekerStatusFilterProps) => {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="careseeker-status-filter">Status</InputLabel>
      <Select
        labelId="careseeker-status-filter"
        label="Status"
        value={value}
        onChange={(e) => onChange(e.target.value as CareseekerStatusFilter)}
      >
        <MenuItem value={STATUS_FILTER_ALL}>All statuses</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
      </Select>
    </FormControl>
  );
};

export default CareseekerStatusFilterControl;
