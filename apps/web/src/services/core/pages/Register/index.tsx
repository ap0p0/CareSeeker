import { Link } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";

const Register = () => {
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
      <h1>Register</h1>
      <p>Create your Careseeker account.</p>
      <p>
        Already have an account?{" "}
        <Link to={BASE_ROUTE_PATHS[BaseRoute.Login]}>Log in</Link>
      </p>
    </div>
  );
};
export default Register;
