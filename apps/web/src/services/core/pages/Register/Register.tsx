import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";
import CoreSimplePageLayout from "../../components/CoreSimplePageLayout";

const Register = () => {
  return (
    <CoreSimplePageLayout
      title="Register"
      description="Create your CareSeeker account."
    >
      <Box sx={{ color: "text.secondary" }}>
        Already have an account?{" "}
        <Link
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.Login]}
          sx={{
            color: "primary.main",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Log in
        </Link>
      </Box>
    </CoreSimplePageLayout>
  );
};

export default Register;
