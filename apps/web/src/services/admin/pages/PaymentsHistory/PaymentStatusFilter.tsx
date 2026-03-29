import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { PaymentStatusFilter } from "./utils";
import { PAYMENT_STATUS_FILTER_ALL } from "./utils";

type PaymentStatusFilterProps = {
  value: PaymentStatusFilter;
  onChange: (v: PaymentStatusFilter) => void;
};

const PaymentStatusFilterControl = ({ value, onChange }: PaymentStatusFilterProps) => {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="payment-status-filter">Status</InputLabel>
      <Select
        labelId="payment-status-filter"
        label="Status"
        value={value}
        onChange={(e) => onChange(e.target.value as PaymentStatusFilter)}
      >
        <MenuItem value={PAYMENT_STATUS_FILTER_ALL}>All statuses</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="failed">Failed</MenuItem>
      </Select>
    </FormControl>
  );
};

export default PaymentStatusFilterControl;
