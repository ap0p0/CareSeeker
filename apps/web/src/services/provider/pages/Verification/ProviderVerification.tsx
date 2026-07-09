import { useState } from "react";
import {
  Alert,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { ProviderPageShell } from "../../components";

const requirements = [
  { id: "id", label: "Government-issued ID", completed: false },
  { id: "cert", label: "Professional certification", completed: false },
  { id: "profile", label: "Complete profile information", completed: true },
];

const ProviderVerification = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return (
    <ProviderPageShell
      title="Verification"
      description="Upload required documents and track your verification status."
    >
      <Stack spacing={2}>
        {statusMessage ? <Alert severity="success">{statusMessage}</Alert> : null}

        <Alert severity="info">Verification status: Pending review</Alert>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <List disablePadding>
            {requirements.map((requirement) => (
              <ListItem key={requirement.id} disableGutters>
                <ListItemIcon>
                  {requirement.completed ? (
                    <CheckCircleOutlineIcon color="success" />
                  ) : (
                    <ErrorOutlineIcon color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={requirement.label}
                  secondary={
                    requirement.completed ? "Completed" : "Missing requirement"
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() =>
              setStatusMessage("ID document upload will be connected to the API.")
            }
          >
            Upload ID document
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() =>
              setStatusMessage(
                "Certification upload will be connected to the API."
              )
            }
          >
            Upload certifications
          </Button>
        </Stack>
      </Stack>
    </ProviderPageShell>
  );
};

export default ProviderVerification;
