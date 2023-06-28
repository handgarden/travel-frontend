import { Avatar, Space } from "antd";
import ProfileLinkButton from "./link/ProfileLinkButton";
import LogoutButton from "./LogoutButton";
import LoginLinkButton from "./link/LoginLinkButton";
import { useAuth } from "../../context/AuthContext";

type NavbarProps = {
  breakPoint: boolean;
};

const MemberNavbar: React.FC<NavbarProps> = ({ breakPoint }) => {
  const { user } = useAuth();

  const authButton =
    user != null ? (
      <Space>
        <>
          {breakPoint ? null : (
            <Avatar
              style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
              size="large"
            >
              {user?.nickname}
            </Avatar>
          )}
          <ProfileLinkButton size="small" ghost />
        </>
        <LogoutButton size="small" ghost />
      </Space>
    ) : (
      <LoginLinkButton size="small" ghost />
    );
  return <>{authButton}</>;
};

export default MemberNavbar;
