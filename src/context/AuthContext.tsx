import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { ChildFC } from "../types/Basic.type";
import useRepository from "../core/hook/useRepository";
import { MemberProfile } from "../types/User.type";

type AuthStatus = "PENDING" | "DONE";

type AuthContextType = {
  status: AuthStatus;
  user: MemberProfile | null;
  checkLogin: () => void;
  login: (data: MemberProfile, redirectURL: string) => void;
  logout: () => void;
  updateNickname: (newNickname: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  status: "PENDING",
  user: null,
  checkLogin: () => {},
  login: () => {},
  logout: () => {},
  updateNickname: () => {},
});

export const AuthProvider: ChildFC = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("PENDING");

  const [user, setUser] = useState<MemberProfile | null>(null);

  const navigate = useNavigate();

  const { AuthRepository } = useRepository();

  const checkLogin = useCallback(async () => {
    const response = await AuthRepository.postLoginWithSession(
      undefined,
      undefined,
      undefined
    );
    const memberDetailProfile = response.response;
    if (response.success === false || memberDetailProfile == null) {
      setStatus("DONE");
      return;
    }
    setUser(memberDetailProfile);
    setStatus("DONE");
  }, [AuthRepository]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const login = useCallback(
    (data: MemberProfile, redirectURL: string) => {
      setUser(data);
      navigate(redirectURL);
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateNickname = useCallback((nickname: string) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        nickname,
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      checkLogin,
      login,
      logout,
      updateNickname,
    }),
    [checkLogin, login, logout, status, updateNickname, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

export const useAuth = () => useContext(AuthContext);
