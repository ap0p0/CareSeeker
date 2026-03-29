import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ADMIN_ROUTE_PATHS, AdminRoute } from "../../../routes/enums";

const STORAGE_KEY = "careseeker.admin.sidebarCollapsed";

const navItems: {
  route: AdminRoute;
  label: string;
  shortLabel: string;
  icon: ReactNode;
}[] = [
  {
    route: AdminRoute.Dashboard,
    label: "Dashboard",
    shortLabel: "Dash",
    icon: <DashboardOutlinedIcon />,
  },
  {
    route: AdminRoute.Careseekers,
    label: "Careseekers",
    shortLabel: "Seekers",
    icon: <PeopleOutlineIcon />,
  },
  {
    route: AdminRoute.CareProviders,
    label: "Care Providers",
    shortLabel: "Providers",
    icon: <LocalHospitalOutlinedIcon />,
  },
  {
    route: AdminRoute.OpenJobs,
    label: "Open Jobs",
    shortLabel: "Jobs",
    icon: <WorkOutlineIcon />,
  },
  {
    route: AdminRoute.PaymentsHistory,
    label: "Payments History",
    shortLabel: "Pay",
    icon: <PaidOutlinedIcon />,
  },
  {
    route: AdminRoute.Reports,
    label: "Reports",
    shortLabel: "Reports",
    icon: <AssessmentOutlinedIcon />,
  },
];

const AdminLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const bottomNavValue = useMemo(() => {
    const match = navItems.find(
      (item) => ADMIN_ROUTE_PATHS[item.route] === location.pathname
    );
    return match ? ADMIN_ROUTE_PATHS[match.route] : false;
  }, [location.pathname]);

  const sidebarTransition = theme.transitions.create(
    ["flex-basis", "max-width", "min-width"],
    { duration: theme.transitions.duration.shorter, easing: theme.transitions.easing.easeInOut }
  );

  const navList = (
    <List dense disablePadding sx={{ py: 1 }}>
      {navItems.map(({ route, label, icon }) => {
        const to = ADMIN_ROUTE_PATHS[route];
        return (
          <ListItemButton
            key={route}
            component={NavLink}
            to={to}
            end={route === AdminRoute.Dashboard}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              "&.active": {
                bgcolor: "action.selected",
                fontWeight: 600,
              },
            }}
          >
            <Tooltip title={collapsed ? label : ""} placement="right" disableHoverListener={!collapsed}>
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: "center",
                  mr: collapsed ? 0 : undefined,
                }}
              >
                {icon}
              </ListItemIcon>
            </Tooltip>
            {!collapsed ? <ListItemText primary={label} /> : null}
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Grid
        container
        wrap="nowrap"
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {!isMobile ? (
          <Grid
            size={{ md: collapsed ? 1 : 3 }}
            sx={{
              flexShrink: 0,
              borderRight: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: sidebarTransition,
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              maxWidth: { md: collapsed ? `${100 / 12}%` : `${(3 / 12) * 100}%` },
            }}
          >
            <Toolbar
              variant="dense"
              disableGutters
              sx={{
                px: 1,
                minHeight: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                gap: 0.5,
              }}
            >
              {!collapsed ? (
                <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ pl: 1 }}>
                  CareSeeker Admin
                </Typography>
              ) : (
                <Typography variant="caption" fontWeight={700} sx={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  Admin
                </Typography>
              )}
              <IconButton
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed((c) => !c)}
                size="small"
              >
                {collapsed ? <MenuOpenIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Toolbar>
            <Divider />
            <Box sx={{ flex: 1, overflow: "auto" }}>{navList}</Box>
          </Grid>
        ) : null}

        <Grid
          size={{ xs: 12, md: collapsed ? 11 : 9 }}
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            transition: sidebarTransition,
            p: { xs: 2, md: 3 },
            pb: { xs: 10, md: 3 },
          }}
        >
          <Outlet />
        </Grid>
      </Grid>

      {isMobile ? (
        <Paper
          square
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <BottomNavigation
            showLabels
            value={bottomNavValue}
            onChange={(_, newPath) => {
              window.scrollTo(0, 0);
              if (typeof newPath === "string") {
                navigate(newPath);
              }
            }}
          >
            {navItems.map(({ route, shortLabel, icon }) => (
              <BottomNavigationAction
                key={route}
                label={shortLabel}
                icon={icon}
                value={ADMIN_ROUTE_PATHS[route]}
              />
            ))}
          </BottomNavigation>
        </Paper>
      ) : null}
    </Box>
  );
};

export default AdminLayout;
