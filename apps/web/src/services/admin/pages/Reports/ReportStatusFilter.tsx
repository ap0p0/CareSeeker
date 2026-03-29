import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { ReportStatusFilter } from "./utils";
import { REPORT_STATUS_FILTER_ALL } from "./utils";

type ReportStatusFilterProps = {
  value: ReportStatusFilter;
  onChange: (v: ReportStatusFilter) => void;
};

const ReportStatusFilterControl = ({ value, onChange }: ReportStatusFilterProps) => {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="report-status-filter">Status</InputLabel>
      <Select
        labelId="report-status-filter"
        label="Status"
        value={value}
        onChange={(e) => onChange(e.target.value as ReportStatusFilter)}
      >
        <MenuItem value={REPORT_STATUS_FILTER_ALL}>All statuses</MenuItem>
        <MenuItem value="ready">Ready</MenuItem>
        <MenuItem value="scheduled">Scheduled</MenuItem>
        <MenuItem value="failed">Failed</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ReportStatusFilterControl;
