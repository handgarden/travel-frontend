import { Route } from "react-router-dom";
import JourneyPage from "../page/JourneyPage";
import AuthGaurd from "../component/AuthGaurd";
import roles from "../../lib/const/auth/role";
import { journeyPath } from "./path";

const JourneyRoute = () => {
  const userRoleTypes = Object.entries(roles)
    .map((e) => e[1].type)
    .filter((t) => t !== "ALL" && t !== "BANNED");
  return (
    <>
      <Route path={journeyPath.HOME} element={<JourneyPage.Home />} />
      <Route
        path={journeyPath.ADD}
        element={
          <AuthGaurd roles={userRoleTypes} element={<JourneyPage.Add />} />
        }
      />
      <Route
        path={journeyPath.EDIT + "/:id"}
        element={
          <AuthGaurd roles={userRoleTypes} element={<JourneyPage.Edit />} />
        }
      />
    </>
  );
};

export default JourneyRoute;
