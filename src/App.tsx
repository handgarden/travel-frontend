import "./App.css";
import { Route, Routes } from "react-router-dom";
import DefaultLayout from "./core/layout/DefaultLayout";
import ErrorPage from "./core/page/error/ErrorPage";
import AuthRoute from "./core/router/AuthRoute";
import AdminRoute, { adminPath } from "./admin/router/AdminRoute";
import UserRoute from "./core/router/UserRoute";
import ErrorRoute from "./core/router/ErrorRoute";
import DestinationRoute from "./core/router/DestinationRoute";
import JourneyRoute from "./core/router/JourneyRoute";
import DestinationPage from "./core/page/DestinationPage";
import { userPath } from "./core/router/path";
import UserLayout from "./core/layout/UserLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />} errorElement={<ErrorPage />}>
        <Route path="/" element={<DestinationPage.Home />} />
        {DestinationRoute()}
        {JourneyRoute()}
      </Route>
      <Route
        path={userPath.USER}
        element={<UserLayout />}
        errorElement={<ErrorPage />}
      >
        {UserRoute()}
      </Route>
      <Route
        path={adminPath.ADMIN}
        element={<UserLayout />}
        errorElement={<ErrorPage />}
      >
        {AdminRoute()}
      </Route>
      {AuthRoute()}
      {ErrorRoute()}
    </Routes>
  );
}

export default App;
