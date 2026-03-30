import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";
import { scrollButtonDockSx } from "./sectionButtonStyles";
import homeHeroCaregiving from "../../../../../assets/core-images/home-hero-caregiving.png";
import CoreMenuButton from "../../../components/CoreMenuButton";

type HeroSectionProps = {
  onNext?: () => void; // optional to avoid strict errors
};

const HeroSection = ({ onNext }: HeroSectionProps) => {
  return (
    <Box
      component="header"
      sx={{
        position: "relative",
        width: "100vw",
        maxWidth: "100vw",
        height: "100dvh",
        minHeight: 320,
        overflow: "hidden",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
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
          maxWidth: 1120,
          mx: "auto",
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 0.75, md: 1.5 },
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
        <CoreMenuButton sticky />
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
          src={homeHeroCaregiving}
          alt=""
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.32) 42%, rgba(188,152,189,0.72) 100%)",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          pb: { xs: "68px", md: "80px" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            textAlign: "left",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              pt: { xs: 10, md: 16 },
              color: "white",
              fontWeight: 700,
              textShadow: "0 2px 4px rgba(0,0,0,0.25)",
              fontSize: { xs: "2rem", md: "3.2rem" },
            }}
          >
            Where the Right Care Finds You.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontSize: { xs: "1rem", md: "1.35rem" },
            }}
          >
            Find the Right Caregiver — Without the Guesswork
          </Typography>
        </Box>
      </Box>
      <Box sx={scrollButtonDockSx}>
        <Button
          onClick={onNext}
          endIcon={<ArrowDownwardIcon />}
          sx={{
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: 999,
            px: 3.25,
            py: 0.9,
            color: "white",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textDecoration: "underline",
            fontSize: { xs: "1.15rem", md: "1.6rem" },
            textUnderlineOffset: 4,
            transition:
              "color 240ms ease-in-out, border-color 240ms ease-in-out, box-shadow 240ms ease-in-out, transform 240ms ease-in-out",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              width: "0%",
              bgcolor: "rgba(255,255,255,0.3)",
              transition: "width 260ms ease-in-out",
              zIndex: 0,
            },
            "& .MuiButton-endIcon, & .MuiButton-startIcon, & .MuiButton-label":
              {
                position: "relative",
                zIndex: 1,
              },
            "&:hover": {
              bgcolor: "transparent",
              color: "#111",
              borderColor: "white",
              textDecoration: "underline",
              transform: "scale(1.03)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
            },
            "&:hover::before": {
              width: "100%",
            },
          }}
        >
          GET STARTED
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
