import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { readMoreButtonSx, scrollButtonDockSx } from "./sectionButtonStyles";

import grandmaGrandson from "../../../../../assets/core-images/grandma_grandson.png";
import grandpaGranddauther from "../../../../../assets/core-images/grandpa_granddauther.png";
import helpingHand from "../../../../../assets/core-images/helping hand.png";
import nurse from "../../../../../assets/core-images/nurse.png";

const people = [
  {
    id: 1,
    img: grandmaGrandson,
    quote:
      "CareSeeker matched us with the perfect caregiver in days. The compatibility score made the decision feel confident and easy.",
    quotePos: "bottom" as const,
  },
  {
    id: 2,
    img: helpingHand,
    quote:
      "Finally, a platform that feels safe and professional. The verification gave our family real peace of mind.",
    quotePos: "top" as const,
  },
  {
    id: 3,
    img: nurse,
    quote:
      "As a caregiver, I’ve never had better client matches. CareSeeker respects my time and helps me grow.",
    quotePos: "bottom" as const,
  },
  {
    id: 4,
    img: grandpaGranddauther,
    quote:
      "The premium service removed all the stress. We felt supported every step of the way.",
    quotePos: "top" as const,
  },
] as const;

type TestimonialsProps = {
  onReadMore?: () => void;
};

const Testimonials = ({ onReadMore }: TestimonialsProps) => {
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
              Client{" "}
            </Box>
            Experience
          </Typography>
        </Box>

        <Grid
          container
          spacing={{ xs: 2, md: 2.5 }}
          sx={{ mb: { xs: 3, md: 5 } }}
        >
          {people.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {p.quotePos === "top" ? (
                  <Box
                    sx={{
                      bgcolor: (t) => t.palette.custom.blue,
                      color: "white",
                      borderRadius: 2.5,
                      px: 1.5,
                      py: 1.25,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {p.quote}
                    </Typography>
                  </Box>
                ) : null}

                <Box
                  component="img"
                  src={p.img}
                  alt=""
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/600x800?text=Photo";
                  }}
                  sx={{
                    width: "100%",
                    aspectRatio: "3/4",
                    objectFit: "cover",
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.6)",
                  }}
                />

                {p.quotePos === "bottom" ? (
                  <Box
                    sx={{
                      bgcolor: (t) => t.palette.custom.blue,
                      color: "white",
                      borderRadius: 2.5,
                      px: 1.5,
                      py: 1.25,
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {p.quote}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
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
  );
};

export default Testimonials;
