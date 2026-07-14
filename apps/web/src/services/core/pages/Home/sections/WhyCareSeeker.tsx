import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { readMoreButtonSx, scrollButtonDockSx } from "./sectionButtonStyles";

import circleInCircle  from "../../../../../assets/core-images/core_sec_whyCareSeeker/circle_in_circles.svg";
import handLeaf  from "../../../../../assets/core-images/core_sec_whyCareSeeker/hand_leaf.svg";
import houseHeart  from "../../../../../assets/core-images/core_sec_whyCareSeeker/house_heart.svg";
import searchComp  from "../../../../../assets/core-images/core_sec_whyCareSeeker/search_computer.svg";


const items = [
  { id: 1, img: circleInCircle, lead: "Compatibility-based", rest: " matching" },
  { id: 2, img: searchComp, lead: "Background-checked", rest: " options" },
  { id: 3, img: houseHeart, lead: "Bonded & insured", rest: " premium care" },
  { id: 4, img: handLeaf, lead: "Independent or fully managed", rest: " support" },
] as const;

type WhyCareSeekerProps = {
  onReadMore?: () => void;
};

const WhyCareSeeker = ({ onReadMore }: WhyCareSeekerProps) => {
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
        bgcolor: "#fbf9fc",
        py: { xs: 4, md: 6 },
        pb: { xs: "68px", md: "80px" },
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
      }}
    >
      <Container maxWidth="lg" sx={{ width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h1"
            fontWeight={700}
            sx={{ fontSize: { xs: "3rem", md: "4rem"}, paddingBottom: "30px" }}
          >
            Why{" "}
            <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
              CareSeeker
            </Box>
            ?
          </Typography>
          <Typography
            variant="subtitle1"
            fontWeight={500}
            color="text.secondary"
            fontSize={{ xs: "1.125rem", md: "1.25rem" }}
          >
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
            py: 2,
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

          <Grid container spacing={0} sx={{ minHeight: 300 }}>
            {items.map((item) => (
              <Grid
                key={item.id}
                size={{ md: 6 }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 4,
                  py: 3.5,
                  gap: "20px",
                  width: "100%",

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
                <Box
                    component="img"
                    src={item.img}
                    alt=""
                    sx={{
                      width: "30%",
                      maxWidth: 100,
                      height: "auto",
                    }}
                    >
                  </Box>
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
          sx={{ mt: { xs: 4, md: 5 }, fontSize: "0.95rem" }}
        >
          You choose the level of protection and service{" "}
          <Box component="span" sx={{ color: (t) => t.palette.custom.blue }}>
            that&apos;s right for you.
          </Box>
        </Typography>

        <Box sx={scrollButtonDockSx}>
          <Button
            onClick={onReadMore}
            variant="text"
            endIcon={<ArrowDownwardIcon />}
            sx={{...readMoreButtonSx, textDecoration: "none !important"}}
          >
            Read more
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WhyCareSeeker;
