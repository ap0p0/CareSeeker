import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";

import grandmaGrandson from "../../../../assets/core-images/grandma_grandson.png";
import grandpaGranddaughter from "../../../../assets/core-images/grandpa_granddaughter.png";
import helpingHand from "../../../../assets/core-images/helping hand.png";
import nurse from "../../../../assets/core-images/nurse.png";

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
    img: grandpaGranddaughter,
    quote:
      "The premium service removed all the stress. We felt supported every step of the way.",
    quotePos: "top" as const,
  },
] as const;

const Testimonials = () => {
  return (
    <Box
      component="section"
      sx={{
        width: "100%",
        bgcolor: "#efe7f2",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Grid
          container
          spacing={{ xs: 2.5, md: 3 }}
          sx={{ mb: { xs: 5, md: 8 } }}
        >
          {people.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {p.quotePos === "top" ? (
                  <Box
                    sx={{
                      bgcolor: (t) => t.palette.custom.blue,
                      color: "white",
                      borderRadius: 3,
                      px: 2,
                      py: 1.75,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
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
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.6)",
                  }}
                />

                {p.quotePos === "bottom" ? (
                  <Box
                    sx={{
                      bgcolor: (t) => t.palette.custom.blue,
                      color: "white",
                      borderRadius: 3,
                      px: 2,
                      py: 1.75,
                    }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      {p.quote}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 6,
                bgcolor: (t) => t.palette.custom.pink,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 4, md: 5 },
                  "&:last-child": { pb: { xs: 4, md: 5 } },
                }}
              >
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                  Care
                  <Box component="span" sx={{ color: "white" }}>
                    Seekers
                  </Box>
                </Typography>
                <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
                  Care that fits your life.
                </Typography>
                <Typography color="rgba(255,255,255,0.95)" sx={{ mb: 3 }}>
                  Whether you need occasional help or full-time support,
                  CareSeeker helps you find someone you can trust.
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    borderColor: "rgba(255,255,255,0.8)",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  Find Care
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 6,
                bgcolor: (t) => t.palette.custom.blue,
                color: "white",
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 4, md: 5 },
                  "&:last-child": { pb: { xs: 4, md: 5 } },
                }}
              >
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                  Caregivers
                </Typography>
                <Typography variant="h6" fontWeight={500} sx={{ mb: 2 }}>
                  Work with families who value your skills.
                </Typography>
                <Typography color="rgba(255,255,255,0.95)" sx={{ mb: 3 }}>
                  Build your profile, get matched with the right clients, and
                  grow your care career.
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    px: 4,
                    borderColor: "rgba(255,255,255,0.8)",
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  Join Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;
