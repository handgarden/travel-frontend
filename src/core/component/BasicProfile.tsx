import { Avatar, Space, Typography } from "antd";
import { MemberBasicProfile } from "../../types/User.type";

type Props = {
  user: MemberBasicProfile;
};

const BasicProfile: React.FC<Props> = ({ user }) => {
  return (
    <Space>
      <Avatar
        style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
        size="small"
      >
        {user.nickname}
      </Avatar>
      <Typography.Text>{user.nickname}</Typography.Text>
    </Space>
  );
};

export default BasicProfile;
