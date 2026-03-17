import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";

const HeroSection = () => {
  return (
    <Box
      component="header"
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 320,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 1, md: 2 },
        }}
      >
        <Button
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.Home]}
          sx={{
            color: "primary.main",
            fontWeight: 700,
            fontSize: { xs: "1.125rem", md: "1.25rem" },
            textTransform: "none",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          📍 CareSeeker
        </Button>
        <Button
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.Login]}
          variant="contained"
          sx={{
            bgcolor: "#93c5fd",
            color: "text.primary",
            fontWeight: 600,
            "&:hover": { bgcolor: "#7dd3fc" },
          }}
        >
          Menu
        </Button>
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src="https://placehold.co/1920x1080/7c3aed/ffffff?text=Stock Image"
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(59,130,246,0.3) 0%, rgba(167,139,250,0.4) 100%)",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            textAlign: "left",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              pt: 30,
              color: "white",
              fontWeight: 700,
              textShadow: "0 2px 4px rgba(0,0,0,0.25)",
            }}
          >
            Where the Right Care Finds You.
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "white",
            }}
          >
            Find the Right Caregiver — Without the Guesswork
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Button
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.Register]}
          endIcon={<ArrowDownwardIcon />}
          sx={{
            pb: 4,
            color: "white",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textDecoration: "underline",
            fontsize: "2rem",
            textUnderlineOffset: 4,
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          GET STARTED
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
