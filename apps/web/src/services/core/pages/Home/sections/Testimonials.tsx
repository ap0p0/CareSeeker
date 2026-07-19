import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import { callToActionCardButtonSx } from "./sectionButtonStyles";

import grandmaGrandson from "../../../../../assets/core-images/grandma_grandson.png";
import grandpaGranddauther from "../../../../../assets/core-images/grandpa_granddauther.png";
import helpingHand from "../../../../../assets/core-images/helping hand.png";
import nurse from "../../../../../assets/core-images/nurse.png";
import Card from "@mui/material/Card/Card";
import CardContent from "@mui/material/CardContent/CardContent";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../../routes/enums";

import { Link as RouterLink } from "react-router-dom";



const people = [
  {
  id: 1,
    img: grandmaGrandson,
    htmlQuote: "<i><b>CareSeeker</b> matched us with the perfect caregiver in days. The compatibility score made the decision feel confident and easy.</i>",
    quotePos: "bottom" as const,
  },
  {
    id: 2,
    img: grandpaGranddauther,
    htmlQuote: "<i>Finally, a platform that feels safe and professional. The verification gave our family <b>real peace of mind.</b></i>",
    quotePos: "top" as const,
  },
  {
    id: 3,
    img: nurse,
    htmlQuote: "<i>As a caregiver, I’ve never had better client matches. <b>CareSeeker</b> respects my time and helps me grow.</i>",
    quotePos: "bottom" as const,
  },
  {
    id: 4,
    img: helpingHand,
    htmlQuote: "<i>The premium service removed all the stress. <b>We felt supported every step of the way.</b></i>",
    quotePos: "top" as const,
  },
] as const;

type TestimonialsProps = {
  onReadMore?: () => void;
};

const Testimonials = ({}: TestimonialsProps) => {
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
        <Grid
          container
          spacing={{ xs: 2, md: 2.5 }}
          sx={{ mb: { xs: 2, md: 4 } }}
        >
          {people.map((p) => {
            const QuotePill = (
              <Box
                sx={{
                  bgcolor: (t) => t.palette.custom.blue,
                  color: "white",
                  borderRadius: 2,
                  px: 2.5,
                  py: 2,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "65px", 
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.72rem", lineHeight: 1.4, "& b": { fontWeight: 700, color: "black" } }}

                  
                  dangerouslySetInnerHTML={{ __html: p.htmlQuote }}
                />
              </Box>
            );

            return (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                {/* Flex layouts naturally push contents vertically based on order */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {p.quotePos === "top" && QuotePill}

                  <Box
                    component="img"
                    src={p.img}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://placehold.co";
                    }}
                    sx={{
                      width: "100%",
                      aspectRatio: "3/4",
                      objectFit: "cover",
                      borderRadius: 2,
                      bgcolor: "rgba(255,255,255,0.6)",
                    }}
                  />

                  {p.quotePos === "bottom" && QuotePill}
                </Box>
              </Grid>
            );
          })}
        </Grid>

        

        
        
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
                  sx={{...callToActionCardButtonSx, textDecoration: "none !important", alignItems: "center" }}
                > 
                  <Box component="span" className="label">
                    Learn More
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
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1, color: "black" }}>
                  Care
                  <span style={{ color: "white" }}>givers</span>
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={500}
                  sx={{ mb: 1.5, color: "black" }}
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
                  sx={{...callToActionCardButtonSx, textDecoration: "none !important", alignItems: "center" }}
                >
                  <Box component="span" className="label">
                    Learn More
                  </Box>
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* <Box sx={scrollButtonDockSx}>
          <Button
            onClick={onReadMore}
            variant="text"
            endIcon={<ArrowDownwardIcon />}
            sx={{ ...readMoreButtonSx, textDecoration: "none !important" }}
          >
            Read more
          </Button>
        </Box> */}

      </Container>
    </Box>
  );
};

export default Testimonials;
