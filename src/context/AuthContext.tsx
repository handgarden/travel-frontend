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
import { MemberBasicProfile } from "../types/User.type";
import { JWT_KEY, LoginResponse } from "../types/Auth.type";

type AuthStatus = "PENDING" | "DONE";

type AuthContextType = {
  status: AuthStatus;
  user: MemberBasicProfile | null;
  checkLogin: () => void;
  login: (data: LoginResponse, redirectURL: string) => void;
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

  const [user, setUser] = useState<MemberBasicProfile | null>(null);

  const navigate = useNavigate();

  const { UserRepository } = useRepository();

  const checkLogin = useCallback(async () => {
    const jwt = localStorage.getItem(JWT_KEY);

    if (!jwt) {
      setStatus("DONE");
      return;
    }
    const response = await UserRepository.getProfile();
    const memberDetailProfile = response.response;
    if (response.success === false || memberDetailProfile == null) {
      setStatus("DONE");
      return;
    }
    setUser(memberDetailProfile);
    setStatus("DONE");
  }, [UserRepository]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const login = useCallback(
    (data: LoginResponse, redirectURL: string) => {
      localStorage.setItem(JWT_KEY, data.accessToken);
      setUser(data.profile);
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
