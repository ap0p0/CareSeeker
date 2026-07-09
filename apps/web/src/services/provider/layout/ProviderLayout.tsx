import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ReviewsOutlinedIcon from "@mui/icons-material/ReviewsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Chip,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PROVIDER_ROUTE_PATHS, ProviderRoute } from "../../../routes/enums";
import { useProviderAuth } from "../auth";
import { clearProviderMockSession } from "../auth/providerDevAuth";

const STORAGE_KEY = "careseeker.provider.sidebarCollapsed";

const navItems: {
  route: ProviderRoute;
  label: string;
  shortLabel: string;
  icon: ReactNode;
  phase?: 2;
}[] = [
  {
    route: ProviderRoute.Dashboard,
    label: "Dashboard",
    shortLabel: "Home",
    icon: <DashboardOutlinedIcon />,
  },
  {
    route: ProviderRoute.ProfilePersonalInformation,
    label: "Profile",
    shortLabel: "Profile",
    icon: <PersonOutlineOutlinedIcon />,
  },
  {
    route: ProviderRoute.Availability,
    label: "Availability",
    shortLabel: "Schedule",
    icon: <CalendarMonthOutlinedIcon />,
  },
  {
    route: ProviderRoute.CareRequests,
    label: "Care Requests",
    shortLabel: "Requests",
    icon: <WorkOutlineIcon />,
  },
  {
    route: ProviderRoute.Reviews,
    label: "Reviews",
    shortLabel: "Reviews",
    icon: <ReviewsOutlinedIcon />,
  },
  {
    route: ProviderRoute.Notifications,
    label: "Notifications",
    shortLabel: "Alerts",
    icon: <NotificationsNoneOutlinedIcon />,
  },
  {
    route: ProviderRoute.Verification,
    label: "Verification",
    shortLabel: "Verify",
    icon: <VerifiedUserOutlinedIcon />,
  },
  {
    route: ProviderRoute.AccountSettings,
    label: "Account Settings",
    shortLabel: "Settings",
    icon: <SettingsOutlinedIcon />,
  },
  {
    route: ProviderRoute.Earnings,
    label: "Earnings",
    shortLabel: "Earnings",
    icon: <AccountBalanceWalletOutlinedIcon />,
    phase: 2,
  },
] as const;

const routePrefixes: Partial<Record<ProviderRoute, string>> = {
  [ProviderRoute.ProfilePersonalInformation]: "/profile",
  [ProviderRoute.Availability]: "/availability",
  [ProviderRoute.CareRequests]: "/care-requests",
  [ProviderRoute.Earnings]: "/earnings",
};

const ProviderLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useProviderAuth();
  const [loggingOut, setLoggingOut] = useState(false);
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

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      clearProviderMockSession();
      await signOut();
      navigate(PROVIDER_ROUTE_PATHS[ProviderRoute.Login], { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }, [navigate, signOut]);

  const isNavItemActive = useCallback(
    (route: ProviderRoute) => {
      const path = PROVIDER_ROUTE_PATHS[route];
      const prefix = routePrefixes[route];

      if (prefix) {
        return location.pathname.startsWith(prefix);
      }

      return location.pathname === path;
    },
    [location.pathname]
  );

  const bottomNavValue = useMemo(() => {
    const match = navItems.find((item) => isNavItemActive(item.route));
    return match ? PROVIDER_ROUTE_PATHS[match.route] : false;
  }, [isNavItemActive]);

  const sidebarTransition = theme.transitions.create(
    ["flex-basis", "max-width", "min-width"],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  );

  const navList = (
    <List dense disablePadding sx={{ py: 1 }}>
      {navItems.map(({ route, label, icon, phase }) => {
        const to = PROVIDER_ROUTE_PATHS[route];
        const active = isNavItemActive(route);

        return (
          <ListItemButton
            key={route}
            component={NavLink}
            to={to}
            selected={active}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              "&.Mui-selected": {
                bgcolor: "action.selected",
                fontWeight: 600,
              },
            }}
          >
            <Tooltip
              title={collapsed ? label : ""}
              placement="right"
              disableHoverListener={!collapsed}
            >
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
            {!collapsed ? (
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>{label}</span>
                    {phase === 2 ? (
                      <Chip label="Phase 2" size="small" variant="outlined" />
                    ) : null}
                  </Box>
                }
              />
            ) : null}
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
        sx={{ flex: 1, minHeight: 0, minWidth: 0 }}
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
              maxWidth: {
                md: collapsed ? `${100 / 12}%` : `${(3 / 12) * 100}%`,
              },
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
                  CareSeeker Provider
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  Provider
                </Typography>
              )}
              <IconButton
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setCollapsed((current) => !current)}
                size="small"
              >
                {collapsed ? <MenuOpenIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Toolbar>
            <Divider />
            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ flex: 1, overflow: "auto" }}>{navList}</Box>
              <Divider />
              <List dense disablePadding sx={{ py: 1 }}>
                <ListItemButton
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  sx={{ borderRadius: 1, mx: 0.5 }}
                >
                  <Tooltip
                    title={collapsed ? "Log out" : ""}
                    placement="right"
                    disableHoverListener={!collapsed}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        justifyContent: "center",
                        mr: collapsed ? 0 : undefined,
                      }}
                    >
                      <LogoutOutlinedIcon />
                    </ListItemIcon>
                  </Tooltip>
                  {!collapsed ? <ListItemText primary="Log out" /> : null}
                </ListItemButton>
              </List>
            </Box>
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
          {isMobile ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<LogoutOutlinedIcon />}
                onClick={() => void handleLogout()}
                disabled={loggingOut}
              >
                Log out
              </Button>
            </Box>
          ) : null}
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
            {navItems.slice(0, 5).map(({ route, shortLabel, icon }) => (
              <BottomNavigationAction
                key={route}
                label={shortLabel}
                icon={icon}
                value={PROVIDER_ROUTE_PATHS[route]}
              />
            ))}
          </BottomNavigation>
        </Paper>
      ) : null}
    </Box>
  );
};

export default ProviderLayout;
