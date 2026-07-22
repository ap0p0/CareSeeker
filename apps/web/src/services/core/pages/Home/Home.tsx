import Box from "@mui/material/Box";
import HeroSection from "./sections/HeroSection";
import Testimonials from "./sections/Testimonials";
import HowItWorks from "./sections/HowItWorks";
import WhyCareSeeker from "./sections/WhyCareSeeker";
import CallToActions from "./sections/CallToActions";

const Home = () => {
  // const containerRef = useRef<HTMLDivElement | null>(null);
  // const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  // const isAnimatingRef = useRef(false);
  // const currentSectionRef = useRef(0);

  // const scrollToSection = useCallback((index: number, duration = 900) => {
  //   const container = containerRef.current;
  //   const target = sectionRefs.current[index];

  //   if (!container || !target) return;
  //   if (isAnimatingRef.current) return;

  //   isAnimatingRef.current = true;
  //   currentSectionRef.current = index;

  //   const start = container.scrollTop;
  //   const targetY = target.offsetTop;
  //   const change = targetY - start;
  //   const startTime = performance.now();

  //   const animateScroll = (currentTime: number) => {
  //     const elapsed = currentTime - startTime;
  //     const progress = Math.min(elapsed / duration, 1);
  //     const ease = 0.5 * (1 - Math.cos(Math.PI * progress));

  //     container.scrollTop = start + change * ease;

  //     if (progress < 1) {
  //       requestAnimationFrame(animateScroll);
  //     } else {
  //       isAnimatingRef.current = false;
  //     }
  //   };

  //   requestAnimationFrame(animateScroll);
  // }, []);

  // useEffect(() => {
  //   const container = containerRef.current;
  //   if (!container) return;

  //   const handleWheel = (e: WheelEvent) => {
  //     if (isAnimatingRef.current) {
  //       e.preventDefault();
  //       return;
  //     }

  //     const threshold = 5;
  //     if (Math.abs(e.deltaY) < threshold) return;

  //     e.preventDefault();

  //     if (
  //       e.deltaY > 0 &&
  //       currentSectionRef.current < sectionRefs.current.length - 1
  //     ) {
  //       scrollToSection(currentSectionRef.current + 1);
  //     } else if (e.deltaY < 0 && currentSectionRef.current > 0) {
  //       scrollToSection(currentSectionRef.current - 1);
  //     }
  //   };

  //   container.addEventListener("wheel", handleWheel, { passive: false });

  //   return () => {
  //     container.removeEventListener("wheel", handleWheel);
  //   };
  // }, [scrollToSection]);

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