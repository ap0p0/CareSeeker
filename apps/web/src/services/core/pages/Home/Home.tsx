import Box from "@mui/material/Box";
import HeroSection from "./sections/HeroSection";
import Testimonials from "./sections/Testimonials";
import HowItWorks from "./sections/HowItWorks";
import WhyCareSeeker from "./sections/WhyCareSeeker";
import CallToActions from "./sections/CallToActions";

const Home = () => {
  return (
    <Box
      sx={{
        width: "100vw",
        maxWidth: "100vw",
        minHeight: "100dvh",
        overflow: "auto",
        bgcolor: "background.default",
      }}
    >
      <Box>
        <HeroSection />
      </Box>

      <Box>
        <HowItWorks />
      </Box>

      <Box>
        <WhyCareSeeker />
      </Box>

      <Box>
        <Testimonials />
      </Box>

      <Box>
        <CallToActions />
      </Box>
    </Box>
  );
};

export default Home;
