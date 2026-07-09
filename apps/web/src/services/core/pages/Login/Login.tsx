import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";
import CoreSimplePageLayout from "../../components/CoreSimplePageLayout";

const Login = () => {
  return (
    <CoreSimplePageLayout
      title="Login"
      description="Sign in to your CareSeeker account."
    >
      <Box sx={{ color: "text.secondary" }}>
        Don&apos;t have an account yet?{" "}
        <Link
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.Register]}
          sx={{
            color: "primary.main",
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Register
        </Link>
      </Box>
    </CoreSimplePageLayout>
  );
};

export default Login;
