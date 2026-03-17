import Box from "@mui/material/Box";
import HeroSection from "./sections/HeroSection";
import HowItWorks from "./sections/HowItWorks";
import WhyCareSeeker from "./sections/WhyCareSeeker";
import Testimonials from "./sections/Testimonials";

const Home = () => {
  return (
    <Box
      sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default" }}
    >
      <HeroSection />
      <HowItWorks />
      <WhyCareSeeker />
      <Testimonials />
    </Box>
  );
};

export default Home;
