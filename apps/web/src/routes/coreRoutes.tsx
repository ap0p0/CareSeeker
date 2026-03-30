import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "./enums";
import AboutUs from "../services/core/pages/AboutUs";
import GetCare from "../services/core/pages/GetCare";
import GiveCare from "../services/core/pages/GiveCare";
import Pricing from "../services/core/pages/Pricing";
import Login from "../services/core/pages/Login";
import Register from "../services/core/pages/Register";
import CoreNotFound from "../services/core/pages/NotFound";
import Home from "../services/core/pages/Home";
export const coreRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<Home />} />
      <Route path={BASE_ROUTE_PATHS[BaseRoute.AboutUs]} element={<AboutUs />} />
      <Route path={BASE_ROUTE_PATHS[BaseRoute.GetCare]} element={<GetCare />} />
      <Route
        path={BASE_ROUTE_PATHS[BaseRoute.GiveCare]}
        element={<GiveCare />}
      />
      <Route path={BASE_ROUTE_PATHS[BaseRoute.Pricing]} element={<Pricing />} />
      <Route path={BASE_ROUTE_PATHS[BaseRoute.Login]} element={<Login />} />
      <Route
        path={BASE_ROUTE_PATHS[BaseRoute.Register]}
        element={<Register />}
      />
      <Route path="*" element={<CoreNotFound />} />
    </>
  )
);
