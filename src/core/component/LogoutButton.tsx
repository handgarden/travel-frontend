import { Button } from "antd";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import useRepository from "../hook/useRepository";
import { SizeType } from "antd/es/config-provider/SizeContext";

type Props = {
  size?: SizeType;
  ghost?: boolean;
};

const LogoutButton: React.FC<Props> = ({ size = "middle", ghost = false }) => {
  const { logout } = useContext(AuthContext);

  const { AuthRepository } = useRepository();

  const sendLogout = () => {
    AuthRepository.postLogout(undefined, undefined, undefined);
    logout();
  };

  return (
    <Button onClick={sendLogout} type="primary" size={size} ghost={ghost}>
      로그아웃
    </Button>
  );
};

export default LogoutButton;
