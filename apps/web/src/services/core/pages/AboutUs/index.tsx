import { Link } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";

const AboutUs = () => {
  return (
    <div>
      <nav>
        <Link to={BASE_ROUTE_PATHS[BaseRoute.Home]}>Home</Link>
        {" · "}
        <Link to={BASE_ROUTE_PATHS[BaseRoute.AboutUs]}>About</Link>
        {" · "}
        <Link to={BASE_ROUTE_PATHS[BaseRoute.Login]}>Login</Link>
        {" · "}
        <Link to={BASE_ROUTE_PATHS[BaseRoute.Register]}>Register</Link>
      </nav>
      <h1>About Us</h1>
      <p>Learn more about Careseeker.</p>
    </div>
  );
};
export default AboutUs;
