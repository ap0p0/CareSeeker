import type { FocusEvent } from "react";
import { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../routes/enums";

const navItems = [
  {
    label: "Home",
    to: BASE_ROUTE_PATHS[BaseRoute.Home],
    icon: HomeRoundedIcon,
  },
  {
    label: "Find Care",
    to: BASE_ROUTE_PATHS[BaseRoute.GetCare],
    icon: SearchRoundedIcon,
  },
  {
    label: "Work",
    to: BASE_ROUTE_PATHS[BaseRoute.GiveCare],
    icon: WorkOutlineRoundedIcon,
  },
  {
    label: "About",
    to: BASE_ROUTE_PATHS[BaseRoute.AboutUs],
    icon: InfoOutlinedIcon,
  },
  {
    label: "Pricing",
    to: BASE_ROUTE_PATHS[BaseRoute.Pricing],
    icon: PaidOutlinedIcon,
  },
] as const;

const menuSurfaceStyles = {
  bgcolor: "rgba(15, 37, 80, 0.3)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.16)",
  backdropFilter: "blur(16px)",
  boxShadow: "0 20px 50px rgba(8, 18, 44, 0.28)",
} as const;

const menuOffset = 6;

type CoreMenuButtonProps = {
  sticky?: boolean;
};

const CoreMenuButton = ({ sticky = false }: CoreMenuButtonProps) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        position: sticky ? "fixed" : "relative",
        top: sticky ? { xs: 12, md: 20 } : "auto",
        right: sticky ? { xs: 12, md: 20 } : "auto",
        zIndex: sticky ? 1200 : 20,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Button
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        startIcon={<MenuRoundedIcon />}
        sx={{
          ...menuSurfaceStyles,
          px: 1.8,
          py: 0.8,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 700,
          fontSize: { xs: "0.95rem", md: "1rem" },
          transition:
            "background-color 220ms ease, color 220ms ease, transform 220ms ease",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.72)",
            color: "#000",
            transform: "translateY(-1px)",
          },
        }}
      >
        Menu
      </Button>

      {open ? (
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            right: 0,
            width: "100%",
            minWidth: { xs: "min(84vw, 280px)", sm: 280 },
            height: `${menuOffset}px`,
          }}
        />
      ) : null}

      <Paper
        elevation={0}
        sx={{
          ...menuSurfaceStyles,
          position: "absolute",
          top: `calc(100% + ${menuOffset}px)`,
          right: 0,
          width: { xs: "min(84vw, 280px)", sm: 280 },
          p: 1.3,
          borderRadius: 3,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 180ms ease, transform 180ms ease, visibility 180ms ease",
          visibility: open ? "visible" : "hidden",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            display: "block",
            mb: 1,
            px: 1,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.78)",
          }}
        >
          Explore CareSeeker
        </Typography>

        <Stack spacing={0.6}>
          {navItems.map(({ label, to, icon: Icon }) => {
            const isActive = pathname === to;

            return (
              <Button
                key={label}
                component={RouterLink}
                to={to}
                startIcon={<Icon />}
                sx={{
                  justifyContent: "flex-start",
                  px: 1.2,
                  py: 1,
                  borderRadius: 2.25,
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#fff",
                  bgcolor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                  transition:
                    "background-color 180ms ease, color 180ms ease, transform 180ms ease",
                  "& .MuiButton-startIcon": {
                    color: "inherit",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.78)",
                    color: "#000",
                    transform: "translateX(2px)",
                  },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Stack>
      </Paper>
    </Box>
  );
};

export default CoreMenuButton;
