import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";

type PasswordTextFieldProps = Omit<TextFieldProps, "type">;

/**
 * `TextField` with a show / hide password toggle. Accepts every `TextField`
 * prop except `type`, so it can be dropped into any auth or settings form.
 */
const PasswordTextField = ({
  disabled,
  InputProps,
  label,
  ...props
}: PasswordTextFieldProps) => {
  const [visible, setVisible] = useState(false);
  const labelText = typeof label === "string" ? label : "password";

  return (
    <TextField
      {...props}
      label={label}
      type={visible ? "text" : "password"}
      disabled={disabled}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={visible ? `Hide ${labelText}` : `Show ${labelText}`}
              onClick={() => setVisible((current) => !current)}
              edge="end"
              disabled={disabled}
            >
              {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PasswordTextField;
