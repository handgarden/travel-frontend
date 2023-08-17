import { Avatar, Space, Typography } from "antd";

type Props = {
  userNickname: string;
};

const BasicProfile: React.FC<Props> = ({ userNickname }) => {
  return (
    <Space>
      <Avatar
        style={{ backgroundColor: "#00a2ae", verticalAlign: "middle" }}
        size="small"
      >
        {userNickname}
      </Avatar>
      <Typography.Text>{userNickname}</Typography.Text>
    </Space>
  );
};

export default BasicProfile;
