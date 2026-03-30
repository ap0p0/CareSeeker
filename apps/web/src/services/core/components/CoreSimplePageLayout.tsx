import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../routes/enums";
import CoreMenuButton from "./CoreMenuButton";

type CoreSimplePageLayoutProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

const CoreSimplePageLayout = ({
  title,
  description,
  children,
}: CoreSimplePageLayoutProps) => {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        background:
          "linear-gradient(180deg, rgba(214, 232, 255, 0.34) 0%, rgba(247, 237, 248, 0.52) 100%)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: { xs: 5, md: 7 },
          }}
        >
          <Button
            component={RouterLink}
            to={BASE_ROUTE_PATHS[BaseRoute.Home]}
            sx={{
              color: "primary.main",
              fontWeight: 700,
              fontSize: { xs: "1.125rem", md: "1.25rem" },
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(19, 53, 111, 0.08)" },
            }}
          >
            CareSeeker
          </Button>

          <CoreMenuButton sticky />
        </Box>

        <Paper
          elevation={0}
          sx={{
            maxWidth: 720,
            mx: "auto",
            p: { xs: 3, md: 5 },
            borderRadius: { xs: 4, md: 5 },
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(19, 53, 111, 0.08)",
            boxShadow: "0 20px 44px rgba(15, 37, 80, 0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Stack spacing={2}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: "2rem", md: "2.8rem" },
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.08rem" },
                color: "text.secondary",
              }}
            >
              {description}
            </Typography>

            {children}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default CoreSimplePageLayout;
