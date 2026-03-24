import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";
import {
  howItWorksCtaBaseSx,
  readMoreButtonSx,
  scrollButtonDockSx,
} from "./sectionButtonStyles";

const steps = [
  { number: 1, title: "Share", description: "Tell us what you need." },
  {
    number: 2,
    title: "Match",
    description: "We match you using AI-enhanced compatibility scoring.",
  },
  {
    number: 3,
    title: "Choose",
    description: "Choose the caregiver who fits best.",
  },
] as const;

type HowItWorksProps = {
  onReadMore?: () => void;
};

const HowItWorks = ({ onReadMore }: HowItWorksProps) => {
  return (
    <Box
      component="section"
      sx={{
        width: "100vw",
        maxWidth: "100vw",
        minHeight: "100dvh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(to top, #f0e8f2 0%, #fbf9fc 100%)",
        py: { xs: 3, md: 5 },
        pb: { xs: "68px", md: "80px" },
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight={500}
            textAlign="center"
            sx={{ color: (t) => t.palette.custom.blue }}
          >
            Smarter Care,{" "}
            <Box component="span" color="text.primary">
              Starts Here.
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: 680, mx: "auto", my: 2.25, fontSize: "0.95rem" }}
          >
            CareSeeker matches families and trusted, skilled caregivers based on
            real compatibility — so you can choose with confidence.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
              mb: { xs: 4.5, md: 6 },
            }}
          >
            <Button
              component={RouterLink}
              to={BASE_ROUTE_PATHS[BaseRoute.GetCare]}
              variant="contained"
              sx={{
                ...howItWorksCtaBaseSx,
                bgcolor: "#b89fc1",
                "&:hover": {
                  bgcolor: "#a58cad",
                  transform: "scale(1.05)",
                  color: "#000",
                  textDecoration: "underline",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                },
              }}
              size="large"
            >
              Find Care
            </Button>
            <Button
              component={RouterLink}
              to={BASE_ROUTE_PATHS[BaseRoute.GiveCare]}
              variant="contained"
              size="large"
              sx={{
                ...howItWorksCtaBaseSx,
                bgcolor: "#5ea6d4",
                "&:hover": {
                  bgcolor: "#4b94c3",
                  transform: "scale(1.05)",
                  color: "#000",
                  textDecoration: "underline",
                  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
                },
              }}
            >
              Join as a Caregiver
            </Button>
          </Box>
        </Container>

        <Container maxWidth="lg">
          <Typography
            variant="h5"
            fontWeight={500}
            textAlign="center"
            sx={{ mb: 3 }}
          >
            Smarter Matching.{" "}
            <Box
              component="span"
              sx={{ color: (t) => t.palette.custom.blue, display: "inline" }}
            >
              Safer Choices.
            </Box>
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {steps.map((step) => (
              <Grid key={step.number} size={{ xs: 12, sm: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    bgcolor: (t) => t.palette.custom.pink,
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2.5, md: 4 },
                      "&:last-child": { pb: { xs: 2.5, md: 4 } },
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight={600}
                      sx={{ lineHeight: 1, mb: 1, color: "white" }}
                    >
                      {step.number}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      sx={{ my: 2, color: (t) => t.palette.custom.blue }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 15, fontWeight: 500, my: 2 }}
                      variant="body1"
                      color="white"
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={scrollButtonDockSx}>
            <Button
              onClick={onReadMore}
              variant="text"
              endIcon={<ArrowDownwardIcon />}
              sx={readMoreButtonSx}
            >
              Read more
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HowItWorks;
