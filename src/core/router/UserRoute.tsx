import { Route } from "react-router-dom";
import AuthGaurd from "../component/AuthGaurd";
import UserPage from "../page/UserPage";
import { userPath } from "./path";

const UserRoute = () => {
  return (
    <>
      <Route
        path={userPath.USER}
        element={<AuthGaurd element={<UserPage.Profile />} />}
      />
      <Route
        path={userPath.PROFILE}
        element={<AuthGaurd element={<UserPage.Profile />} />}
      />
      <Route
        path={userPath.DESTINATION}
        element={<AuthGaurd element={<UserPage.Destination />} />}
      />
      <Route
        path={userPath.DESCRIPTION}
        element={<AuthGaurd element={<UserPage.Description />} />}
      />
      <Route
        path={userPath.JOURNEY}
        element={<AuthGaurd element={<UserPage.Journey />} />}
      />
      <Route
        path={userPath.COMMENT}
        element={<AuthGaurd element={<UserPage.Comment />} />}
      />
      <Route
        path={userPath.PAYMENT_METHOD}
        element={<AuthGaurd element={<UserPage.PaymentMethod />} />}
      />
      <Route
        path={userPath.ORDER}
        element={<AuthGaurd element={<UserPage.Order />} />}
      />
      <Route
        path={userPath.SALES}
        element={<AuthGaurd element={<UserPage.Sales />} />}
      />
      <Route
        path={userPath.SALES + "/:id"}
        element={<AuthGaurd element={<UserPage.SalesDetail />} />}
      />
    </>
  );
};

export default UserRoute;
