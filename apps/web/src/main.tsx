import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import "./index.css";
import App from "./App.tsx";
import { getAppVariant } from "./config/appVariant";
import { QueryProvider } from "./queries/QueryProvider";
import { AdminAuthProvider } from "./services/admin/auth";
import { ClientAuthProvider } from "./services/client/auth";
import { ProviderAuthProvider } from "./services/provider/auth";

const appVariant = getAppVariant();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
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
    </QueryProvider>
  </StrictMode>,
);
