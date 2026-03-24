import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#2563eb" },
    secondary: { main: "#a78bfa" },
    custom: {
      blue: "#75b9e3",
      pink: "#d0b9d8",
    },
    background: { default: "#fff", paper: "#fff" },
    text: { primary: "#1e293b", secondary: "#475569" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      '"Montserrat", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
});
