import { Button } from "antd";
import { Link } from "react-router-dom";
import useQueryString from "../../hook/useQueryString";
import { authPath } from "../../router/path";

type Props = {
  className?: string;
};

const RegisterLinkButton: React.FC<Props> = ({ className }) => {
  const query = useQueryString();
  const path = query.redirect
    ? authPath.REGISTER + "?redirect=" + query.redirect
    : authPath.REGISTER;

  return (
    <>
      <Link to={path}>
        <Button className={className}>회원가입</Button>
      </Link>
    </>
  );
};

export default RegisterLinkButton;
