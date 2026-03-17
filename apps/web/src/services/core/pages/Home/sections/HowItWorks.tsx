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

const HowItWorks = () => {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(to top, #f0e8f2 0%, #fbf9fc 100%)",
        py: { xs: 6, md: 10 },
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Container maxWidth="md">
          <Typography
            variant="h5"
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
            sx={{ maxWidth: 720, mx: "auto", my: 3 }}
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
              mb: { xs: 6, md: 8 },
            }}
          >
            <Button
              component={RouterLink}
              to={BASE_ROUTE_PATHS[BaseRoute.GetCare]}
              variant="contained"
              sx={{
                bgcolor: (t) => t.palette.custom.pink,
                color: "white",
                px: 5,
                borderRadius: 999,
                "&:hover": {
                  bgcolor: (t) => t.palette.custom.pink,
                  opacity: 0.9,
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
                px: 5,
                borderRadius: 999,
                bgcolor: (t) => t.palette.custom.blue,
                color: "white",
                "&:hover": {
                  bgcolor: (t) => t.palette.custom.blue,
                  opacity: 0.9,
                },
              }}
            >
              Join as a Caregiver
            </Button>
          </Box>
        </Container>

        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight={500}
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Smarter Matching.{" "}
            <Box
              component="span"
              sx={{ color: (t) => t.palette.custom.blue, display: "inline" }}
            >
              Safer Choices.
            </Box>
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
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
                      p: 4,
                      "&:last-child": { pb: 4 },
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight={600}
                      sx={{ lineHeight: 1, mb: 1, color: "text.primary" }}
                    >
                      {step.number}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={500}
                      sx={{ my: 3, color: (t) => t.palette.custom.blue }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 16, fontWeight: 500, my: 3 }}
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

          <Typography textAlign="center" variant="h4" fontWeight={700}>
            That's it.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              component={RouterLink}
              to={BASE_ROUTE_PATHS[BaseRoute.AboutUs]}
              variant="text"
              endIcon={<ArrowDownwardIcon />}
              sx={{
                color: (t) => t.palette.custom.blue,
                fontWeight: 700,
                textDecoration: "underline",
                textUnderlineOffset: 4,
                "&:hover": {
                  textDecoration: "underline",
                  bgcolor: "transparent",
                },
              }}
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
