import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { MemberBasicProfile } from "../../types/User.type";

const useAuthorization = (resourceUser?: MemberBasicProfile) => {
  const { user } = useAuth();

  const hasAuth = useMemo<boolean>(() => {
    //로그인 정보가 없는 경우
    if (!user || !resourceUser) {
      return false;
    }

    //소유한 경우
    if (user.nickname === resourceUser.nickname) {
      return true;
    }

    return false;
  }, [user, resourceUser]);

  return hasAuth;
};

export default useAuthorization;
