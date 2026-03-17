import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";
import getCareHeroImage from "../../../../assets/core-images/get-care-hero.png";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    bgcolor: "rgba(255,255,255,0.75)",
    boxShadow: "0 6px 20px rgba(19, 33, 68, 0.06)",
    "& fieldset": {
      borderColor: "rgba(92, 124, 160, 0.22)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(184, 159, 193, 0.8)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(94, 166, 212, 0.95)",
      borderWidth: 2,
    },
  },
} as const;

const backToHomeButtonSx = {
  alignSelf: "flex-start",
  mb: { xs: 1.5, md: 2 },
  px: 1.5,
  py: 0.6,
  borderRadius: 999,
  textTransform: "none",
  fontWeight: 700,
  color: "#fff",
  bgcolor: "rgba(94, 166, 212, 0.7)",
  border: "1px solid rgba(94, 166, 212, 0.45)",
  textDecoration: "none",
  transition:
    "background-color 240ms ease-in-out, color 240ms ease-in-out, transform 240ms ease-in-out, box-shadow 240ms ease-in-out",
  "&:hover": {
    color: "#000",
    bgcolor: "rgba(184, 159, 193, 0.3)",
    borderColor: "rgba(184, 159, 193, 0.6)",
    transform: "translateY(-1px)",
    boxShadow: "0 8px 18px rgba(15, 37, 80, 0.1)",
    textDecoration: "none",
  },
} as const;

const GetCare = () => {
  const [accepted, setAccepted] = useState(false);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        py: { xs: 3.5, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          alignItems="stretch"
          sx={{ minHeight: { md: "80dvh" } }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: { xs: 4, md: 6 },
                px: { xs: 2.5, sm: 3.25, md: 5 },
                py: { xs: 3, md: 4.25 },
                background:
                  "linear-gradient(170deg, rgba(255,255,255,0.92) 0%, rgba(255,250,255,0.84) 100%)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 14px 34px rgba(15, 37, 80, 0.08)",
              }}
            >
              <Button
                component={RouterLink}
                to={BASE_ROUTE_PATHS[BaseRoute.Home]}
                variant="outlined"
                sx={backToHomeButtonSx}
              >
                {"\u2190 Back to Home"}
              </Button>

              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: (t) => t.palette.custom.blue,
                  letterSpacing: 0.2,
                  mb: { xs: 2.2, md: 3.2 },
                }}
              >
                CareSeeker
              </Typography>

              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  fontSize: { xs: "2rem", sm: "2.35rem", md: "2.75rem" },
                  lineHeight: 1.15,
                }}
              >
                Join CareSeeker Early Access
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 1.2,
                  mb: 3,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                }}
              >
                Be the first to know when we launch.
              </Typography>

              <Stack
                component="form"
                spacing={1.6}
                onSubmit={(event) => event.preventDefault()}
              >
                <TextField
                  label="Name"
                  name="name"
                  required
                  fullWidth
                  autoComplete="given-name"
                  sx={inputSx}
                />
                <TextField
                  label="Surname"
                  name="surname"
                  required
                  fullWidth
                  autoComplete="family-name"
                  sx={inputSx}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  fullWidth
                  autoComplete="email"
                  sx={inputSx}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                      sx={{
                        color: (t) => t.palette.custom.blue,
                        "&.Mui-checked": {
                          color: (t) => t.palette.custom.pink,
                        },
                      }}
                    />
                  }
                  label="I agree to be notified when CareSeeker goes live"
                  sx={{
                    mt: 0.5,
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.95rem",
                      color: "text.secondary",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!accepted}
                  sx={{
                    mt: 0.5,
                    py: 1.2,
                    borderRadius: 999,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                    background:
                      "linear-gradient(90deg, #b89fc1 0%, #5ea6d4 100%)",
                    boxShadow: "0 12px 26px rgba(82, 126, 170, 0.26)",
                    transition:
                      "transform 240ms ease-in-out, box-shadow 240ms ease-in-out, color 240ms ease-in-out, background 240ms ease-in-out",
                    "&:hover": {
                      color: "#000",
                      textDecoration: "underline",
                      background:
                        "linear-gradient(90deg, #a489b0 0%, #4b94c3 100%)",
                      transform: "scale(1.02)",
                      boxShadow: "0 14px 28px rgba(54, 99, 148, 0.28)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(255,255,255,0.8)",
                      background:
                        "linear-gradient(90deg, rgba(184,159,193,0.7) 0%, rgba(94,166,212,0.7) 100%)",
                    },
                  }}
                >
                  Join Waitlist
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: "relative",
                height: "100%",
                minHeight: { xs: 360, sm: 430, md: "100%" },
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: { xs: 4, md: 6 },
                  overflow: "hidden",
                  boxShadow: "0 22px 44px rgba(20, 44, 81, 0.17)",
                }}
              >
                <Box
                  component="img"
                  src={getCareHeroImage}
                  alt="Caregiver and senior using a laptop together"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "transparent",
                  }}
                />
              </Box>

              <Paper
                elevation={0}
                sx={{
                  position: "absolute",
                  top: { xs: 16, md: 22 },
                  left: { xs: 16, md: 22 },
                  px: 1.4,
                  py: 0.6,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.86)",
                  color: (t) => t.palette.custom.blue,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  backdropFilter: "blur(3px)",
                }}
              >
                Trusted Care Starts Here
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  position: "absolute",
                  right: { xs: 16, md: 22 },
                  bottom: { xs: 16, md: 22 },
                  px: 1.6,
                  py: 0.8,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.9)",
                  color: "text.primary",
                  boxShadow: "0 10px 24px rgba(16, 36, 70, 0.12)",
                }}
              >
                <Typography
                  sx={{ fontSize: "0.78rem", fontWeight: 700, lineHeight: 1.2 }}
                >
                  Early Access
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    mt: 0.2,
                    lineHeight: 1.2,
                  }}
                >
                  Limited spots available
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default GetCare;
