import { Tag } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { ROLE_TYPE, Role } from "../../types/User.type";

type Props = {
  role: Role<ROLE_TYPE>;
};

const RoleTag: React.FC<Props> = ({ role }) => {
  let color: PresetColorType = "volcano";
  switch (role.type) {
    case "ADMIN":
      color = "green";
      break;
    case "MANAGER":
      color = "cyan";
      break;
    case "USER":
      color = "geekblue";
      break;
    default:
      break;
  }
  return <Tag color={color}>{role.kr}</Tag>;
};

export default RoleTag;
