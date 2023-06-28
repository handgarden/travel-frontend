import { Link } from "react-router-dom";
import { Button } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { userPath } from "../../router/path";
type Props = {
  size?: SizeType;
  ghost?: boolean;
};

const ProfileLinkButton: React.FC<Props> = ({
  size = "middle",
  ghost = false,
}) => {
  return (
    <Link to={userPath.USER}>
      <Button type="primary" size={size} ghost={ghost}>
        프로필
      </Button>
    </Link>
  );
};

export default ProfileLinkButton;
