import { RouterProvider } from "react-router-dom";
import { getAppVariant } from "./config/appVariant";
import { coreRouter } from "./routes/coreRoutes";
import { clientRouter } from "./routes/clientRoutes";
import { providerRouter } from "./routes/providerRoutes";
import { adminRouter } from "./routes/adminRoutes";

function App() {
  const variant = getAppVariant();
  const router =
    variant === "core"
      ? coreRouter
      : variant === "client"
        ? clientRouter
        : variant === "provider"
          ? providerRouter
          : adminRouter;

  return <RouterProvider router={router} />;
}

export default App;
