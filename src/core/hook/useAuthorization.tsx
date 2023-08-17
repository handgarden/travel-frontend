import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

const useAuthorization = (creatorNickname?: string) => {
  const { user } = useAuth();

  const hasAuth = useMemo<boolean>(() => {
    //로그인 정보가 없는 경우
    if (!user || !creatorNickname) {
      return false;
    }

    //소유한 경우
    if (user.nickname === creatorNickname) {
      return true;
    }

    return false;
  }, [user, creatorNickname]);

  return hasAuth;
};

export default useAuthorization;
