import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { JobStatusFilter } from "./utils";
import { JOB_STATUS_FILTER_ALL } from "./utils";

type JobStatusFilterProps = {
  value: JobStatusFilter;
  onChange: (v: JobStatusFilter) => void;
};

const JobStatusFilterControl = ({ value, onChange }: JobStatusFilterProps) => {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="open-job-status-filter">Status</InputLabel>
      <Select
        labelId="open-job-status-filter"
        label="Status"
        value={value}
        onChange={(e) => onChange(e.target.value as JobStatusFilter)}
      >
        <MenuItem value={JOB_STATUS_FILTER_ALL}>All statuses</MenuItem>
        <MenuItem value="open">Open</MenuItem>
        <MenuItem value="filled">Filled</MenuItem>
        <MenuItem value="cancelled">Cancelled</MenuItem>
      </Select>
    </FormControl>
  );
};

export default JobStatusFilterControl;
