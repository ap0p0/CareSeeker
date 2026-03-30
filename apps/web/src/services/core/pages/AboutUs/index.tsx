import Typography from "@mui/material/Typography";
import CoreSimplePageLayout from "../../components/CoreSimplePageLayout";

const AboutUs = () => {
  return (
    <CoreSimplePageLayout
      title="About CareSeeker"
      description="CareSeeker helps families find trusted care and helps care professionals discover meaningful work."
    >
      <Typography sx={{ color: "text.secondary" }}>
        We are building a simpler way to connect the right people at the right
        time, with a thoughtful experience for both care seekers and care
        providers.
      </Typography>
    </CoreSimplePageLayout>
  );
};

export default AboutUs;
