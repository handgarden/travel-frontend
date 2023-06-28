import { Button } from "antd";
import { Link } from "react-router-dom";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { authPath } from "../../router/path";
import useRedirectPath from "../../hook/useRedirectPath";

type Props = {
  size?: SizeType;
  ghost?: boolean;
};

const LoginLinkButton: React.FC<Props> = ({
  size = "middle",
  ghost = false,
}) => {
  const redirectUrl = useRedirectPath();

  return (
    <Link to={authPath.LOGIN + redirectUrl}>
      <Button type="primary" size={size} ghost={ghost}>
        로그인
      </Button>
    </Link>
  );
};

export default LoginLinkButton;
