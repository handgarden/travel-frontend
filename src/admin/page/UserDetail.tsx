import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  ROLE_TYPE,
  Role,
  MemberDetailProfile,
  UpdateNicknameForm,
} from "../../types/User.type";
import { Card, Descriptions, Divider, Space, Typography } from "antd";
import HtmlParser from "../component/HtmlParser";
import useRepository from "../../core/hook/useRepository";
import UpdateRole from "../component/modal/UpdateRole";
import RoleTag from "../../core/component/RoleTag";
import UserBan from "../component/modal/UserBan";
import roles from "../../lib/const/auth/role";
import UserUnBan from "../component/modal/UserUnBan";
import UpdateNicknameAdmin from "../component/modal/UpdateNicknameAdmin";

const UserDetail: React.FC = () => {
  const params = useParams<"nickname">();
  const nickname = params.nickname;
  const [user, setUser] = useState<MemberDetailProfile | null>(null);

  const { AdminRepository } = useRepository();

  const getData = useCallback(async () => {
    if (!nickname) {
      return;
    }
    const data = await AdminRepository.getUserDetail(nickname, undefined);
    setUser(data.response);
  }, [AdminRepository, nickname]);

  useEffect(() => {
    getData();
  }, [getData]);

  const updateNickname = (newNickname: string) => {
    setUser((u) => {
      if (!u) {
        return u;
      }
      return {
        ...u,
        nickname: newNickname,
      };
    });
  };

  const updateRole = (newRole: Role<ROLE_TYPE>) => {
    setUser((u) => {
      if (!u) {
        return u;
      }
      return {
        ...u,
        role: newRole,
      };
    });
  };

  const banUser = () => {
    // setUser((u) => {
    //   if (!u) {
    //     return u;
    //   }
    //   return {
    //     ...u,
    //     role: roles.BANNED,
    //   };
    // });
    //권한만 변경되는게 아니라 정지 내역도 업데이트해야됨
    //따라서 정보 자체를 다시 가져오는게 맞음
    getData();
  };

  const unbanUser = () => {
    setUser((u) => {
      if (!u) {
        return u;
      }
      return {
        ...u,
        role: roles.USER,
      };
    });
  };

  if (!user) {
    return <></>;
  }

  return (
    <Space direction="vertical" style={{ display: "flex" }} size="large">
      <Descriptions title="회원 정보" bordered column={1}>
        <Descriptions.Item label="권한">
          <RoleTag role={user.role} />
          {user.role.id !== 5 ? (
            <UpdateRole userData={user} updateRole={updateRole} />
          ) : null}
        </Descriptions.Item>
        <Descriptions.Item label="계정">{user.account}</Descriptions.Item>
        <Descriptions.Item label="닉네임">
          <Typography.Text style={{ marginRight: "1rem" }}>
            {user.nickname}
          </Typography.Text>
          <UpdateNicknameAdmin
            userData={user}
            postNickname={(data: UpdateNicknameForm) => {
              return AdminRepository.postNickname(data, undefined, undefined);
            }}
            updateNickname={updateNickname}
          />
        </Descriptions.Item>
        <Descriptions.Item label="생성일">
          {new Date(user.createdAt).toLocaleString("ko-KR")}
        </Descriptions.Item>
        <Descriptions.Item label="수정일">
          {new Date(user.updatedAt).toLocaleString("ko-KR")}
        </Descriptions.Item>
        <Descriptions.Item label="계정 정지">
          {user.role.id !== 5 ? (
            <UserBan user={user} banUser={banUser} />
          ) : (
            <UserUnBan unbanNickname={user.nickname} unbanUser={unbanUser} />
          )}
        </Descriptions.Item>
      </Descriptions>
      <Card title="정지 내역">
        <Space direction="vertical" style={{ display: "flex" }} size="middle">
          {user.banInfoList.map((info) => (
            <Card
              type="inner"
              title={"ID: " + info.id}
              key={info.id.toString()}
            >
              <Typography.Text>
                {"담당자: " + info.creator.nickname}
              </Typography.Text>
              <Divider />
              <Typography.Text>{"정지 사유: "}</Typography.Text>
              <HtmlParser html={info.description} />
            </Card>
          ))}
        </Space>
      </Card>
    </Space>
  );
};

export default UserDetail;
