import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";
import CoreSimplePageLayout from "../../components/CoreSimplePageLayout";

const Pricing = () => {
  return (
    <CoreSimplePageLayout
      title="Pricing"
      description="Simple pricing options are on the way. We are finalizing plans for families looking for care and professionals looking for work."
    >
      <Typography sx={{ color: "text.secondary" }}>
        Contact us or join one of the early access lists while we finalize the
        launch pricing details.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} pt={1}>
        <Button
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.GetCare]}
          variant="contained"
          sx={{ textTransform: "none", borderRadius: 999, fontWeight: 700 }}
        >
          Find Care
        </Button>
        <Button
          component={RouterLink}
          to={BASE_ROUTE_PATHS[BaseRoute.GiveCare]}
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: 999, fontWeight: 700 }}
        >
          Work with CareSeeker
        </Button>
      </Stack>
    </CoreSimplePageLayout>
  );
};

export default Pricing;
