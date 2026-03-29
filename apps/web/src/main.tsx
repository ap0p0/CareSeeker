import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import "./index.css";
import App from "./App.tsx";
import { getAppVariant } from "./config/appVariant";
import { AdminAuthProvider } from "./services/admin/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {getAppVariant() === "admin" ? (
            <AdminAuthProvider>
              <App />
            </AdminAuthProvider>
          ) : (
            <App />
          )}
        </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
