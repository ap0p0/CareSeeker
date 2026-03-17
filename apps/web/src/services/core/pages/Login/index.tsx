import { Link } from "react-router-dom";
import { BaseRoute, BASE_ROUTE_PATHS } from "../../../../routes/enums";

const Login = () => {
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
      <h1>Login</h1>
      <p>Sign in to your account.</p>
      <p>
        Don&apos;t have an account?{" "}
        <Link to={BASE_ROUTE_PATHS[BaseRoute.Register]}>Register</Link>
      </p>
    </div>
  );
};
export default Login;
