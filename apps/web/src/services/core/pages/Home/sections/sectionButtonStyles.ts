import type { SxProps, Theme } from "@mui/material/styles";

export const readMoreButtonSx: SxProps<Theme> = {
  mt: 0,
  px: 3.25,
  py: 1.1,
  fontSize: { xs: "1rem", md: "1.1rem" },
  fontWeight: 700,
  textTransform: "none",
  textUnderlineOffset: 4,
  transition:
    "transform 240ms ease-in-out, box-shadow 240ms ease-in-out, color 240ms ease-in-out, background-color 240ms ease-in-out",
  "&, &:visited, &:active": {
    color: "#000",
    textDecoration: "underline",
  },
  "&:hover": {
    textDecoration: "underline",
    bgcolor: "rgba(0,0,0,0.14)",
    color: "#fff",
    transform: "scale(1.05)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  },
};

export const howItWorksCtaBaseSx: SxProps<Theme> = {
  px: 4.5,
  borderRadius: 999,
  fontWeight: 700,
  textTransform: "none",
  textUnderlineOffset: 4,
  transition:
    "transform 240ms ease-in-out, box-shadow 240ms ease-in-out, color 240ms ease-in-out, background-color 240ms ease-in-out",
  "&, &:visited, &:active": {
    color: "#fff",
    textDecoration: "underline",
  },
  "&:hover": {
    transform: "scale(1.05)",
    color: "#000",
    textDecoration: "underline",
    boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
  },
};

export const callToActionCardButtonSx: SxProps<Theme> = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 999,
  px: 4,
  borderColor: "rgba(255,255,255,0.8)",
  textTransform: "none",
  textUnderlineOffset: 4,
  transition:
    "transform 240ms ease-in-out, box-shadow 240ms ease-in-out, color 240ms ease-in-out, background-color 240ms ease-in-out",
  "&, &:visited, &:active": {
    color: "#fff",
    textDecoration: "underline",
  },
  "& .label": {
    position: "relative",
    zIndex: 1,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    width: "0%",
    bgcolor: "rgba(255,255,255,0.25)",
    transition: "width 260ms ease",
    zIndex: 0,
  },
  "&:hover::before": {
    width: "100%",
  },
  "&:hover": {
    borderColor: "white",
    bgcolor: "rgba(0,0,0,0.14)",
    color: "#000",
    textDecoration: "underline",
    transform: "scale(1.05)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
  },
};
