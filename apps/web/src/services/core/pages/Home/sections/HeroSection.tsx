  import { Link as RouterLink } from "react-router-dom";
  import Box from "@mui/material/Box";
  import Typography from "@mui/material/Typography";
  import Button from "@mui/material/Button";
  import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
  import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";
  import { scrollButtonDockSx } from "./sectionButtonStyles";

  import homeHeroCaregiving from "../../../../../assets/core-images/home_hero_care_giving_cropped.svg";
  import CoreMenuButton from "../../../components/CoreMenuButton";
  import logo from "../../../../../assets/core-images/Logo-v1.svg";

  type HeroSectionProps = {
    onNext?: () => void; 
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
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
          position: "absolute",
          top: { xs: "12px", md: "16px" }, 
          left: { xs: "12px", md: "16px" },
          right: { xs: "12px", md: "16px" },
          zIndex: 20, 
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: { xs: "calc(100% - 24px)", md: "calc(100% - 32px)" },
          pointerEvents: "none",
          }}
        >
          <Button
            component={RouterLink}
            to={BASE_ROUTE_PATHS[BaseRoute.Home]}
            sx={{
              p: 0,
              minWidth: 0,
              bgcolor: "transparent",
              borderRadius: "0 0 22px 0",
              overflow: "hidden",
              pointerEvents: "auto",

              width: {
                xs: 165,
                md: 205,
              },

              height: {
                xs: 58,
                md: 72,
              },

              "&:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="CareSeeker"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                px: 2,
                py: 1,
              }}
            />
          </Button>
          <CoreMenuButton sticky />
        </Box>

        <Box
          sx={{
            position: "absolute",
             inset: { xs: "12px", md: "16px" }, 
            overflow: "hidden",
            borderRadius: { xs: "16px", md: "24px" },
            bgcolor: "transparent",
            backgroundImage: "transparent",
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
              objectPosition: "center 0%",
              backgroundColor: "white",
              
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.32) 42%, rgba(188,152,189,0.72) 100%)",
            }}
          />
        </Box>

        <Box
          sx={{
            position: "absolute",
            inset: { xs: "12px", md: "16px" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            textAlign: "center",
            pb: { xs: "120px", md: "140px" },
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              px: 3,
              textAlign: "auto",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                pt: { xs: 10, md: 16 },
                color: "white",
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.25)",
                fontSize: { xs: "2.2rem", sm: "3.5rem", md: "4.5rem" },
                lineHeight: { xs: 1.2, md: 1.1 },
              }}
            >
              Where the Right Care Finds You.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontweight: 400,
                fontSize: { xs: "1rem", md: "1.5rem" },
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
              textDecoration: "none !important",
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
                textDecoration: "none !important",
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
