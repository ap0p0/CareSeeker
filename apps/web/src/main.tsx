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
import { ClientAuthProvider } from "./services/client/auth";
import { ProviderAuthProvider } from "./services/provider/auth";

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

const appVariant = getAppVariant();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {appVariant === "admin" ? (
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        ) : appVariant === "client" ? (
          <ClientAuthProvider>
            <App />
          </ClientAuthProvider>
        ) : appVariant === "provider" ? (
          <ProviderAuthProvider>
            <App />
          </ProviderAuthProvider>
        ) : (
          <App />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
