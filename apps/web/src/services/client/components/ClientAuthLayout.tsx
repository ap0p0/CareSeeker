import type { ReactNode } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { env } from "../../../config/env";
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../routes/enums";

type ClientAuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerMode: "login" | "register";
  formError?: string | null;
  statusMessage?: string | null;
  /** When false, hides the login/register switch link. Defaults to true. */
  showAuthFooter?: boolean;
  /** In-flow back action (e.g. previous register step). */
  onBack?: () => void;
};

const ClientAuthLayout = ({
  title,
  description,
  children,
  footerMode,
  formError = null,
  statusMessage = null,
  showAuthFooter = true,
  onBack,
}: ClientAuthLayoutProps) => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      py={4}
      sx={{
        background:
          "linear-gradient(180deg, rgba(214, 232, 255, 0.42) 0%, rgba(247, 237, 248, 0.66) 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 460,
          width: 1,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: "1px solid rgba(19, 53, 111, 0.08)",
          boxShadow: "0 20px 44px rgba(15, 37, 80, 0.08)",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.82)",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight={700}
              sx={{ color: (t) => t.palette.custom.blue }}
            >
              {title}
            </Typography>
            <Typography color="text.secondary">{description}</Typography>
          </Stack>

          {formError ? <Alert severity="error">{formError}</Alert> : null}
          {statusMessage ? (
            <Alert severity="success">{statusMessage}</Alert>
          ) : null}

          {children}

          {onBack ? (
            <Button
              type="button"
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              fullWidth
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: "text.secondary",
              }}
            >
              Back
            </Button>
          ) : (
            <Button
              component="a"
              href={env.mainPlatformUrl}
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              fullWidth
              sx={{
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Back to home
            </Button>
          )}

          {showAuthFooter ? (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {footerMode === "login"
                ? "Need an account? "
                : "Already have an account? "}
              <MuiLink
                component={RouterLink}
                to={
                  footerMode === "login"
                    ? SEEKER_ROUTE_PATHS[SeekerRoute.Register]
                    : SEEKER_ROUTE_PATHS[SeekerRoute.Login]
                }
                underline="hover"
              >
                {footerMode === "login" ? "Register" : "Log in"}
              </MuiLink>
            </Typography>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
};

export default ClientAuthLayout;
