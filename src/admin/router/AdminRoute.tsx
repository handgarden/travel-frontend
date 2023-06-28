import { Route } from "react-router-dom";
import AuthGaurd from "../../core/component/AuthGaurd";
import UserManagement from "../page/UserManagement";
import roles from "../../lib/const/auth/role";
import UserDetail from "../page/UserDetail";

const defaultPath = "/admin";

export const adminPath = {
  ADMIN: defaultPath,
  USER_MANAGEMENT: defaultPath + "/users",
  USER_DETAIL: defaultPath + "/users/:nickname",
};

const AdminRoute = () => {
  return (
    <>
      <Route
        path={adminPath.ADMIN}
        element={
          <AuthGaurd
            roles={[roles.ADMIN.type, roles.MANAGER.type]}
            element={<UserManagement />}
          />
        }
      />
      <Route
        path={adminPath.USER_MANAGEMENT}
        element={
          <AuthGaurd
            roles={[roles.ADMIN.type, roles.MANAGER.type]}
            element={<UserManagement />}
          />
        }
      />
      <Route
        path={adminPath.USER_DETAIL}
        element={
          <AuthGaurd
            roles={[roles.ADMIN.type, roles.MANAGER.type]}
            element={<UserDetail />}
          />
        }
      />
    </>
  );
};

export default AdminRoute;
