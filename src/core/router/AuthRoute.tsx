import { Route } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import LoginPage from "../page/auth/LoginPage";
import RegisterPage from "../page/auth/RegisterPage";
import { authPath } from "./path";

const AuthRoute = () => {
  return (
    <Route path={authPath.LOGIN} element={<AuthLayout />}>
      <Route path={authPath.LOGIN} element={<LoginPage />} />
      <Route path={authPath.REGISTER} element={<RegisterPage />} />
    </Route>
  );
};

export default AuthRoute;
