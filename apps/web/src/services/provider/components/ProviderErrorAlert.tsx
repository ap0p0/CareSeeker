import { Alert, Button } from "@mui/material";

type ProviderErrorAlertProps = {
  message: string;
  onRetry?: () => void;
};

const ProviderErrorAlert = ({ message, onRetry }: ProviderErrorAlertProps) => {
  return (
    <Alert
      severity="error"
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
};

export default ProviderErrorAlert;
