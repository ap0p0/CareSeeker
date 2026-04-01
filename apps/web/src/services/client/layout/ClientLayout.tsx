import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ReviewsOutlinedIcon from "@mui/icons-material/ReviewsOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
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
import { SEEKER_ROUTE_PATHS, SeekerRoute } from "../../../routes/enums";
import { useClientAuth } from "../auth";

const STORAGE_KEY = "careseeker.client.sidebarCollapsed";

const navItems: {
  route: SeekerRoute;
  label: string;
  shortLabel: string;
  icon: ReactNode;
}[] = [
  {
    route: SeekerRoute.Overview,
    label: "Overview",
    shortLabel: "Overview",
    icon: <DashboardOutlinedIcon />,
  },
  {
    route: SeekerRoute.Jobs,
    label: "Open Jobs",
    shortLabel: "Jobs",
    icon: <WorkOutlineIcon />,
  },
  {
    route: SeekerRoute.NewJob,
    label: "Add New Job",
    shortLabel: "New",
    icon: <AddBoxOutlinedIcon />,
  },
  {
    route: SeekerRoute.History,
    label: "History",
    shortLabel: "History",
    icon: <HistoryOutlinedIcon />,
  },
  {
    route: SeekerRoute.SavedProviders,
    label: "Saved Providers",
    shortLabel: "Saved",
    icon: <BookmarkBorderOutlinedIcon />,
  },
  {
    route: SeekerRoute.Explore,
    label: "Explore",
    shortLabel: "Explore",
    icon: <TravelExploreOutlinedIcon />,
  },
  {
    route: SeekerRoute.Notifications,
    label: "Notifications",
    shortLabel: "Alerts",
    icon: <NotificationsNoneOutlinedIcon />,
  },
  {
    route: SeekerRoute.Messages,
    label: "Messages",
    shortLabel: "Messages",
    icon: <MessageOutlinedIcon />,
  },
  {
    route: SeekerRoute.ReviewsRatings,
    label: "Reviews & Ratings",
    shortLabel: "Reviews",
    icon: <ReviewsOutlinedIcon />,
  },
  {
    route: SeekerRoute.SubscriptionsPayments,
    label: "Subscription & Payments",
    shortLabel: "Billing",
    icon: <CreditCardOutlinedIcon />,
  },
  {
    route: SeekerRoute.MyAccount,
    label: "My Account",
    shortLabel: "Account",
    icon: <PersonOutlineOutlinedIcon />,
  },
] as const;

const ClientLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClientAuth();
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
      await signOut();
      navigate(SEEKER_ROUTE_PATHS[SeekerRoute.Login], { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }, [navigate, signOut]);

  const bottomNavValue = useMemo(() => {
    const match = navItems.find((item) => {
      const to = SEEKER_ROUTE_PATHS[item.route];
      return location.pathname === to;
    });

    return match ? SEEKER_ROUTE_PATHS[match.route] : false;
  }, [location.pathname]);

  const sidebarTransition = theme.transitions.create(
    ["flex-basis", "max-width", "min-width"],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeInOut,
    }
  );

  const navList = (
    <List dense disablePadding sx={{ py: 1 }}>
      {navItems.map(({ route, label, icon }) => {
        const to = SEEKER_ROUTE_PATHS[route];
        const end = route === SeekerRoute.Overview;

        return (
          <ListItemButton
            key={route}
            component={NavLink}
            to={to}
            end={end}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              "&.active": {
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
                  CareSeeker Client
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                >
                  Client
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
                value={SEEKER_ROUTE_PATHS[route]}
              />
            ))}
          </BottomNavigation>
        </Paper>
      ) : null}
    </Box>
  );
};

export default ClientLayout;
