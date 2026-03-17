import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";
import { ArrowUpward as ArrowUpwardIcon } from "@mui/icons-material";
import {
  callToActionCardButtonSx,
  readMoreButtonSx,
  scrollButtonDockSx,
} from "./sectionButtonStyles";

type CallToActionsProps = {
  onReadMore?: () => void;
};

const CallToActions = ({ onReadMore }: CallToActionsProps) => {
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
        bgcolor: "#efe7f2",
        py: { xs: 3, md: 5 },
        pb: { xs: "68px", md: "80px" },
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
      }}
    >
      <Container maxWidth="lg" sx={{ width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="h3" fontWeight={600}>
            <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
              Join{" "}
            </Box>
            CareSeeker
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            fontWeight={500}
            sx={{ fontSize: { xs: "1.7rem", md: "2.2rem" } }}
          >
            Care, Matched with{" "}
            <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
              Confidence
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: 1.5,
              fontSize: { xs: "1rem", md: "1.15rem" },
              maxWidth: 900,
              mx: "auto",
            }}
          >
            You&apos;re not just hiring help. You&apos;re trusting others with
            someone you love.
          </Typography>
          <Typography
            sx={{
              color: (t) => t.palette.custom.blue,
              fontSize: { xs: "1rem", md: "1.15rem" },
              maxWidth: 900,
              mx: "auto",
            }}
          >
            CareSeeker was built to honor that trust.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3.5,
                bgcolor: (t) => t.palette.custom.pink,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  "&:last-child": { pb: { xs: 3, md: 4 } },
                }}
              >
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  Care
                  <Box component="span" sx={{ color: "white" }}>
                    Seekers
                  </Box>
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  sx={{ mb: 1.5 }}
                >
                  Care that fits your life.
                </Typography>
                <Typography
                  color="rgba(255,255,255,0.95)"
                  sx={{ mb: 2.25, fontSize: "0.95rem" }}
                >
                  Whether you need occasional help or full-time support,
                  CareSeeker helps you find someone you can trust.
                </Typography>
                <Button
                  component={RouterLink}
                  to={BASE_ROUTE_PATHS[BaseRoute.GetCare]}
                  variant="outlined"
                  sx={callToActionCardButtonSx}
                >
                  <Box component="span" className="label">
                    Find Care
                  </Box>
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3.5,
                bgcolor: (t) => t.palette.custom.blue,
                color: "white",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 3, md: 4 },
                  "&:last-child": { pb: { xs: 3, md: 4 } },
                }}
              >
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  Care
                  <span style={{ color: "#d0b9d8" }}>givers</span>
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  sx={{ mb: 1.5 }}
                >
                  Work with families who value your skills.
                </Typography>
                <Typography
                  color="rgba(255,255,255,0.95)"
                  sx={{ mb: 2.25, fontSize: "0.95rem" }}
                >
                  Build your profile, get matched with the right clients, and
                  grow your care career.
                </Typography>
                <Button
                  component={RouterLink}
                  to={BASE_ROUTE_PATHS[BaseRoute.GiveCare]}
                  variant="outlined"
                  sx={callToActionCardButtonSx}
                >
                  <Box component="span" className="label">
                    Join Now
                  </Box>
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={scrollButtonDockSx}>
          <Button
            onClick={onReadMore}
            variant="text"
            endIcon={<ArrowUpwardIcon />}
            sx={readMoreButtonSx}
          >
            Back to Top
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CallToActions;
