import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingPage from "../page/LoadingPage";
import useRedirectPath from "../hook/useRedirectPath";

type Props = {
  element: React.ReactNode;
  allowGuest?: boolean;
};

//로그인 필수
const AuthGaurd: React.FC<Props> = ({ element }) => {
  const { user, status } = useAuth();

  const redirectPath = useRedirectPath();

  //로그인 안한 상태
  if (!user) {
    if (status === "PENDING") {
      return <LoadingPage />;
    }

    const path = "/login" + redirectPath;
    window.alert("로그인이 필요합니다");
    return <Navigate to={path} replace />;
  }

  return <>{element}</>;
};

export default AuthGaurd;
