import { Route } from "react-router-dom";
import JourneyPage from "../page/JourneyPage";
import AuthGaurd from "../component/AuthGaurd";
import { journeyPath } from "./path";

const JourneyRoute = () => {
  return (
    <>
      <Route path={journeyPath.HOME} element={<JourneyPage.Home />} />
      <Route
        path={journeyPath.ADD}
        element={<AuthGaurd element={<JourneyPage.Add />} />}
      />
      <Route
        path={journeyPath.EDIT + "/:id"}
        element={<AuthGaurd element={<JourneyPage.Edit />} />}
      />
    </>
  );
};

export default JourneyRoute;
