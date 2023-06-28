import { Route } from "react-router-dom";
import AuthGaurd from "../component/AuthGaurd";
import roles from "../../lib/const/auth/role";
import UserPage from "../page/UserPage";
import { userPath } from "./path";

const UserRoute = () => {
  const userRoleTypes = Object.entries(roles)
    .map((e) => e[1].type)
    .filter((t) => t !== "ALL" && t !== "BANNED");
  return (
    <>
      <Route
        path={userPath.USER}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Profile />} />
        }
      />
      <Route
        path={userPath.PROFILE}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Profile />} />
        }
      />
      <Route
        path={userPath.DESTINATION}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Destination />} />
        }
      />
      <Route
        path={userPath.DESCRIPTION}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Description />} />
        }
      />
      <Route
        path={userPath.JOURNEY}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Journey />} />
        }
      />
      <Route
        path={userPath.COMMENT}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Comment />} />
        }
      />
      <Route
        path={userPath.PAYMENT_METHOD}
        element={
          <AuthGaurd
            roles={userRoleTypes}
            element={<UserPage.PaymentMethod />}
          />
        }
      />
      <Route
        path={userPath.ORDER}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Order />} />
        }
      />
      <Route
        path={userPath.SALES}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.Sales />} />
        }
      />
      <Route
        path={userPath.SALES + "/:id"}
        element={
          <AuthGaurd roles={userRoleTypes} element={<UserPage.SalesDetail />} />
        }
      />
    </>
  );
};

export default UserRoute;
