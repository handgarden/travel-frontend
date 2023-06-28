import { useAuth } from "../../context/AuthContext";
import { ROLE_TYPE } from "../../types/User.type";
import { Navigate } from "react-router-dom";
import LoadingPage from "../page/LoadingPage";
import { errorPath } from "../router/ErrorRoute";
import useRedirectPath from "../hook/useRedirectPath";

type Props = {
  roles: ROLE_TYPE[];
  element: React.ReactNode;
  allowGuest?: boolean;
};

//로그인 필수
//권한은 설정하는 권한의 상위 권한은 가능(id 낮을 수록 상위 권한), 하위는 불가능
const AuthGaurd: React.FC<Props> = ({ element, roles, allowGuest = false }) => {
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

  //로그인 한 상태 + 권한 제약 없음
  if (allowGuest) {
    return <>{element}</>;
  }

  //설정한 권한에 포함되지 않는 경우
  if (!roles.includes(user.role.type)) {
    return <Navigate to={errorPath.ERROR} />;
  }

  //권한이 맞는 경우
  return <>{element}</>;
};

export default AuthGaurd;
