import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Link as RouterLink } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";

const items = [
  { id: 1, lead: "Compatibility-based", rest: " matching" },
  { id: 2, lead: "Background-checked", rest: " options" },
  { id: 3, lead: "Bonded & insured", rest: " premium care" },
  { id: 4, lead: "Independent or fully managed", rest: " support" },
] as const;

const WhyCareSeeker = () => {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: "#fbf9fc",
        py: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            fontWeight={600}
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
          >
            Why{" "}
            <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
              CareSeeker
            </Box>
            ?
          </Typography>
          <Typography variant="h6" fontWeight={500} color="text.secondary">
            Because{" "}
            <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
              Trust
            </Box>{" "}
            Matters
          </Typography>
        </Box>

        {/* Desktop/tablet cross grid */}
        <Box
          sx={{
            position: "relative",
            display: { xs: "none", md: "block" },
            maxWidth: 980,
            mx: "auto",
            py: 3,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "1px",
              bgcolor: "rgba(0,0,0,0.12)",
              transform: "translateX(-0.5px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "1px",
              bgcolor: "rgba(0,0,0,0.12)",
              transform: "translateY(-0.5px)",
            }}
          />

          <Grid container spacing={0} sx={{ minHeight: 360 }}>
            {items.map((item) => (
              <Grid
                key={item.id}
                size={{ md: 6 }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 6,
                  py: 5,
                }}
              >
                <Typography variant="body1" fontWeight={500}>
                  <Box
                    component="span"
                    sx={{ color: (t) => t.palette.custom.blue }}
                  >
                    {item.lead}
                  </Box>
                  {item.rest}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mobile stacked layout */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            maxWidth: 520,
            mx: "auto",
          }}
        >
          {items.map((item, idx) => (
            <Box key={item.id} sx={{ py: 2.5, textAlign: "center" }}>
              <Typography variant="body1" fontWeight={500}>
                <Box
                  component="span"
                  sx={{ color: (t) => t.palette.custom.blue }}
                >
                  {item.lead}
                </Box>
                {item.rest}
              </Typography>
              {idx !== items.length - 1 ? <Divider sx={{ mt: 2.5 }} /> : null}
            </Box>
          ))}
        </Box>

        <Typography
          textAlign="center"
          color="text.secondary"
          sx={{ mt: { xs: 6, md: 8 } }}
        >
          You choose the level of protection and service{" "}
          <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
            that&apos;s right for you.
          </Box>
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
  );
};

export default WhyCareSeeker;
