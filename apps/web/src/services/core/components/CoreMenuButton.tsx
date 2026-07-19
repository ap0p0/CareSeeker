// import type { FocusEvent } from "react";
// import { useState } from "react";
// import { Link as RouterLink, useLocation } from "react-router-dom";
// import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
// import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
// import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
// import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
// import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
// import Paper from "@mui/material/Paper";
// import Stack from "@mui/material/Stack";
// import Typography from "@mui/material/Typography";
// import { BaseRoute, BASE_ROUTE_PATHS } from "../../../routes/enums";

// const navItems = [
//   {
//     label: "Home",
//     to: BASE_ROUTE_PATHS[BaseRoute.Home],
//     icon: HomeRoundedIcon,
//   },
//   {
//     label: "Find Care",
//     to: BASE_ROUTE_PATHS[BaseRoute.GetCare],
//     icon: SearchRoundedIcon,
//   },
//   {
//     label: "Work",
//     to: BASE_ROUTE_PATHS[BaseRoute.GiveCare],
//     icon: WorkOutlineRoundedIcon,
//   },
//   {
//     label: "About",
//     to: BASE_ROUTE_PATHS[BaseRoute.AboutUs],
//     icon: InfoOutlinedIcon,
//   },
//   {
//     label: "Pricing",
//     to: BASE_ROUTE_PATHS[BaseRoute.Pricing],
//     icon: PaidOutlinedIcon,
//   },
// ] as const;

// const menuSurfaceStyles = {
//   bgcolor: "rgba(15, 37, 80, 0.3)",
//   color: "#fff",
//   border: "1px solid rgba(255,255,255,0.16)",
//   backdropFilter: "blur(16px)",
//   boxShadow: "0 20px 50px rgba(8, 18, 44, 0.28)",
// } as const;

// const menuOffset = 6;

// type CoreMenuButtonProps = {
//   sticky?: boolean;
// };

// const CoreMenuButton = ({ sticky = false }: CoreMenuButtonProps) => {
//   const { pathname } = useLocation();
//   const [open, setOpen] = useState(false);

//   return (
//     <Box
//       sx={{
//         position: sticky ? "fixed" : "relative",
//         top: sticky ? { xs: 12, md: 20 } : "auto",
//         right: sticky ? { xs: 12, md: 20 } : "auto",
//         zIndex: sticky ? 1200 : 20,
//       }}
//       onMouseEnter={() => setOpen(true)}
//       onMouseLeave={() => setOpen(false)}
//       onFocusCapture={() => setOpen(true)}
//       onBlurCapture={(event: FocusEvent<HTMLDivElement>) => {
//         if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
//           setOpen(false);
//         }
//       }}
//     >
//       <Button
//         aria-haspopup="menu"
//         aria-expanded={open ? "true" : "false"}
//         startIcon={<MenuRoundedIcon />}
//         sx={{
//           ...menuSurfaceStyles,
//           px: 1.8,
//           py: 0.8,
//           borderRadius: 999,
//           textTransform: "none",
//           fontWeight: 700,
//           fontSize: { xs: "0.95rem", md: "1rem" },
//           transition:
//             "background-color 220ms ease, color 220ms ease, transform 220ms ease",
//           "&:hover": {
//             bgcolor: "rgba(255,255,255,0.72)",
//             color: "#000",
//             transform: "translateY(-1px)",
//           },
//         }}
//       >
//         Menu
//       </Button>

//       {open ? (
//         <Box
//           sx={{
//             position: "absolute",
//             top: "100%",
//             right: 0,
//             width: "100%",
//             minWidth: { xs: "min(84vw, 280px)", sm: 280 },
//             height: `${menuOffset}px`,
//           }}
//         />
//       ) : null}

//       <Paper
//         elevation={0}
//         sx={{
//           ...menuSurfaceStyles,
//           position: "absolute",
//           top: `calc(100% + ${menuOffset}px)`,
//           right: 0,
//           width: { xs: "min(84vw, 280px)", sm: 280 },
//           p: 1.3,
//           borderRadius: 3,
//           opacity: open ? 1 : 0,
//           transform: open ? "translateY(0)" : "translateY(-8px)",
//           pointerEvents: open ? "auto" : "none",
//           transition:
//             "opacity 180ms ease, transform 180ms ease, visibility 180ms ease",
//           visibility: open ? "visible" : "hidden",
//         }}
//       >
//         <Typography
//           variant="overline"
//           sx={{
//             display: "block",
//             mb: 1,
//             px: 1,
//             letterSpacing: "0.14em",
//             color: "rgba(255,255,255,0.78)",
//           }}
//         >
//           Explore CareSeeker
//         </Typography>

//         <Stack spacing={0.6}>
//           {navItems.map(({ label, to, icon: Icon }) => {
//             const isActive = pathname === to;

//             return (
//               <Button
//                 key={label}
//                 component={RouterLink}
//                 to={to}
//                 startIcon={<Icon />}
//                 sx={{
//                   justifyContent: "flex-start",
//                   px: 1.2,
//                   py: 1,
//                   borderRadius: 2.25,
//                   textTransform: "none",
//                   fontWeight: 600,
//                   color: "#fff",
//                   bgcolor: isActive ? "rgba(255,255,255,0.18)" : "transparent",
//                   transition:
//                     "background-color 180ms ease, color 180ms ease, transform 180ms ease",
//                   "& .MuiButton-startIcon": {
//                     color: "inherit",
//                   },
//                   "&:hover": {
//                     bgcolor: "rgba(255,255,255,0.78)",
//                     color: "#000",
//                     transform: "translateX(2px)",
//                   },
//                 }}
//               >
//                 {label}
//               </Button>
//             );
//           })}
//         </Stack>
//       </Paper>
//     </Box>
//   );
// };

// export default CoreMenuButton;


import type { MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../routes/enums";

const navItems = [
  { label: "Plans", to: BASE_ROUTE_PATHS[BaseRoute.Pricing] },
  { label: "Get Care", to: BASE_ROUTE_PATHS[BaseRoute.GetCare] },
  { label: "Give Care", to: BASE_ROUTE_PATHS[BaseRoute.GiveCare] },
  { label: "About", to: BASE_ROUTE_PATHS[BaseRoute.AboutUs] },
  { label: "Log In", to: BASE_ROUTE_PATHS[BaseRoute.Login] },
] as const;

const CHIP_WIDTH = 80;
const CHIP_HEIGHT = 44;
const CHIP_RADIUS = 14;
const ITEM_GAP = 12;
const EDGE_GAP = 24; 

const SLIDE_DURATION = 250;
const FADE_DURATION = 150;
const STAGGER_STEP = 45;

type CoreMenuButtonProps = {
  sticky?: boolean;
};

const CoreMenuButton = ({ sticky = false }: CoreMenuButtonProps) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [itemWidths, setItemWidths] = useState<number[]>(() => navItems.map(() => 0));

  useLayoutEffect(() => {
    const widths = itemRefs.current.map((el) => el?.getBoundingClientRect().width ?? 0);
    setItemWidths(widths);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const rightOffsets = itemWidths.map((_, index) =>
    itemWidths
      .slice(0, index)
      .reduce((sum, width) => sum + width + ITEM_GAP, EDGE_GAP),
  );
  const menuOpenRight =
    itemWidths.reduce((sum, width) => sum + width + ITEM_GAP, EDGE_GAP) -
    ITEM_GAP +
    EDGE_GAP; 
  const totalCascadeDuration = SLIDE_DURATION + navItems.length * STAGGER_STEP;

  const handleToggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: sticky ? "fixed" : "relative",
        top: sticky ? { xs: 12, md: 20 } : "auto",
        right: sticky ? { xs: 12, md: 20 } : "auto",
        height: CHIP_HEIGHT,
        zIndex: 1200,
        pointerEvents: "auto",
      }}
    >

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
          width: open ? `${menuOpenRight + CHIP_WIDTH}px` : `${CHIP_WIDTH}px`,
          borderRadius: 999,
          bgcolor: "rgba(188, 152, 189, 0.85)",
          border: "1px solid rgba(255,255,255,0.35)",
          backdropFilter: "blur(10px)",
          boxShadow: open ? "0 10px 30px rgba(30, 10, 40, 0.25)" : "none",
          transition: `width ${totalCascadeDuration}ms ease, box-shadow ${SLIDE_DURATION}ms ease`,
          overflow: "hidden",
        }}
      />

      {navItems.map((item, i) => {
        const isActive = pathname === item.to;
        const giveCare = item.label === "Give Care";

        const openDelay = i * STAGGER_STEP;
        const closeDelay = (navItems.length - 1 - i) * STAGGER_STEP;
        const delay = open ? openDelay : closeDelay;

        return (
          <Button
            key={item.label}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            component={RouterLink}
            to={item.to}
            disableRipple
            sx={{
              position: "absolute",
              top: 0,
              right: open ? `${rightOffsets[i]}px` : `0px`,
              height: CHIP_HEIGHT,
              minWidth: 0,
              px: "18px",
              whiteSpace: "nowrap",
              fontSize: "0.95rem",
              textTransform: "none",
              bgcolor: "transparent", 
              border: "none",
              boxShadow: "none",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              color: giveCare ? "#1a1a1a" : isActive ? "#fff" : "rgba(255,255,255,0.82)",
              fontWeight: giveCare || isActive ? 700 : 500,
              zIndex: 0,
              transition: [
                `right ${SLIDE_DURATION}ms ease ${delay}ms`,
                `opacity ${FADE_DURATION}ms ease ${delay}ms`,
              ].join(", "),
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.12)",
                color: giveCare ? "#1a1a1a" : "#fff",
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}

      <Button
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        disableRipple
        sx={{
          position: "absolute",
          top: 0,
          right: open ? `${menuOpenRight}px` : "0px",
          width: CHIP_WIDTH,
          height: CHIP_HEIGHT,
          minWidth: 0,
          borderRadius: `${CHIP_RADIUS}px`,
          bgcolor: "#21ABE2",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.95rem",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          zIndex: 1,
          transition: `right ${totalCascadeDuration}ms ease, transform 180ms ease, background-color 180ms ease`,
          "&:hover": {
            bgcolor: "#21ABE2",
            transform: "scale(1.04)",
          },
        }}
      >
        Menu
      </Button>
    </Box>
  );
};

export default CoreMenuButton;