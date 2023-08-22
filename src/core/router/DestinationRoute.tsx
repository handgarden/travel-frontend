import { Route } from "react-router-dom";
import DestinationPage from "../page/DestinationPage";
import AuthGaurd from "../component/AuthGaurd";
import { CATEGORY } from "../../lib/const/category";
import { destinationPath } from "./path";
import AccommodationPage from "../page/AccommodationPage";

const DestinationRoute = () => {
  return (
    <>
      <Route path={destinationPath.HOME} element={<DestinationPage.Home />} />
      {Object.entries(CATEGORY)
        .splice(0)
        .map((c) => (
          <Route
            key={c[1].type.toLocaleLowerCase()}
            path={destinationPath[c[1].type]}
            element={<DestinationPage.Home />}
          />
        ))}
      {Object.entries(CATEGORY)
        .splice(0)
        .map((c) => (
          <Route
            key={c[1].type.toLocaleLowerCase()}
            path={destinationPath[c[1].type] + "/add"}
            element={<AuthGaurd element={<DestinationPage.Add />} />}
          />
        ))}
      {Object.entries(CATEGORY)
        .splice(0)
        .map((c) => {
          if (c[1].type === "ACCOMMODATION") {
            return (
              <Route
                key={c[1].type.toLocaleLowerCase() + "Detail"}
                path={destinationPath[c[1].type] + "/:id"}
                element={<AccommodationPage.Detail />}
              />
            );
          }

          return (
            <Route
              key={c[1].type.toLocaleLowerCase() + "Detail"}
              path={destinationPath[c[1].type] + "/:id"}
              element={<DestinationPage.Detail />}
            />
          );
        })}
      <Route
        path={destinationPath.RESERVE_ROOM}
        element={<AuthGaurd element={<AccommodationPage.ReserveRoom />} />}
      />
      <Route
        path={destinationPath.RESTAURANT}
        element={<DestinationPage.Detail />}
      />
      <Route
        path={destinationPath.ENJOYMENT}
        element={<DestinationPage.Detail />}
      />
      <Route path={destinationPath.ETC} element={<DestinationPage.Detail />} />
      <Route
        path={destinationPath.ADD}
        element={<AuthGaurd element={<DestinationPage.Add />} />}
      />
    </>
  );
};

export default DestinationRoute;
