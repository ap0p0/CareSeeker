import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";
import { howItWorksCtaBaseSx } from "../Home/sections/sectionButtonStyles";

type DashboardVariant = "client" | "provider";

const getDashboardUrl = (variant: DashboardVariant) => {
  if (typeof window === "undefined") return "/";

  const { protocol, hostname, port } = window.location;
  const hostParts = hostname.split(".");
  const appSubdomains = new Set(["client", "provider", "admin"]);

  let targetHost = hostname;

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost")
  ) {
    targetHost = `${variant}.localhost`;
  } else if (hostParts.length > 1 && appSubdomains.has(hostParts[0])) {
    targetHost = [variant, ...hostParts.slice(1)].join(".");
  } else {
    targetHost = `${variant}.${hostname}`;
  }

  const portSuffix = port ? `:${port}` : "";
  return `${protocol}//${targetHost}${portSuffix}/`;
};

const dashboardButtonSx = {
  ...howItWorksCtaBaseSx,
  width: "100%",
  justifyContent: "center",
  py: 1.2,
} as const;

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to top, #f0e8f2 0%, #fbf9fc 100%)",
        px: 2,
        py: { xs: 4, md: 7 },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: "center",
            bgcolor: "rgba(255,255,255,0.82)",
            borderRadius: { xs: 4, md: 5 },
            px: { xs: 2.5, md: 5 },
            py: { xs: 4, md: 5 },
            boxShadow: "0 18px 40px rgba(22, 32, 62, 0.1)",
            border: "1px solid rgba(255,255,255,0.7)",
            backdropFilter: "blur(2px)",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              color: (t) => t.palette.custom.blue,
              fontSize: { xs: "2.15rem", md: "2.75rem" },
              fontWeight: 700,
            }}
          >
            Page Not Found
          </Typography>
          <Typography
            sx={{
              mt: 1.5,
              mx: "auto",
              maxWidth: 500,
              color: "text.secondary",
              fontSize: { xs: "0.98rem", md: "1.08rem" },
            }}
          >
            The page you&apos;re looking for does not exist or may have been
            moved. Let&apos;s get you back to the right place.
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 3.5 }}>
            <Button
              component={RouterLink}
              to={BASE_ROUTE_PATHS[BaseRoute.Home]}
              variant="contained"
              sx={{
                ...dashboardButtonSx,
                bgcolor: (t) => t.palette.custom.blue,
                "&:hover": {
                  bgcolor: "#4b94c3",
                  transform: "scale(1.05)",
                  color: "#000",
                  textDecoration: "underline",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              Back to Home
            </Button>

            <Button
              component="a"
              href={getDashboardUrl("client")}
              variant="contained"
              sx={{
                ...dashboardButtonSx,
                bgcolor: (t) => t.palette.custom.pink,
                "&:hover": {
                  bgcolor: "#a58cad",
                  transform: "scale(1.05)",
                  color: "#000",
                  textDecoration: "underline",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              Open Care Seeker Dashboard
            </Button>

            <Button
              component="a"
              href={getDashboardUrl("provider")}
              variant="contained"
              sx={{
                ...dashboardButtonSx,
                bgcolor: (t) => t.palette.custom.blue,
                "&:hover": {
                  bgcolor: "#4b94c3",
                  transform: "scale(1.05)",
                  color: "#000",
                  textDecoration: "underline",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              Open Care Provider Dashboard
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;
