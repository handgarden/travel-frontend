import {
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Modal,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { DownOutlined } from "@ant-design/icons";
import styles from "./UpdateRole.module.scss";
import { useAuth } from "../../../context/AuthContext";
import useModalState from "../../../core/hook/useModalState";
import { ROLE_TYPE, Role, MemberProfile } from "../../../types/User.type";
import roles from "../../../lib/const/auth/role";
import useRepository from "../../../core/hook/useRepository";
import { UserRoleUpdate } from "../../../types/Admin.type";

type Props = {
  userData: MemberProfile;
  updateRole: (newRole: Role<ROLE_TYPE>) => void;
};

const UpdateRole: React.FC<Props> = ({ userData, updateRole }) => {
  const { isModalOpen, handleCancel, showModal } = useModalState();

  const { user } = useAuth();

  const items: MenuProps["items"] = Object.values(roles)
    .filter((r) => r.id !== 5 && r.id !== userData.role.id && r.id !== 1)
    .map((value) => {
      return {
        key: value.id.toString(),
        label: value.kr,
        disabled: !!user && user.role.id >= value.id,
      };
    });

  const [globalError, setGlobalError] = useState<string>("");

  const [newRole, setNewRole] = useState<Role<ROLE_TYPE> | null>(null);

  useEffect(() => {
    setGlobalError("");
    setNewRole(null);
  }, [isModalOpen]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const role: Role<ROLE_TYPE>[] = Object.values(roles).filter(
      (value) => value.id === parseInt(e.key)
    );
    if (role.length > 0) {
      setNewRole(role[0]);
      setGlobalError("");
    }
  };

  const { AdminRepository } = useRepository();

  const handleOk = async () => {
    if (!newRole) {
      setGlobalError("새 권한을 선택해주세요.");
      return;
    }

    if (userData.role.type === newRole.type) {
      window.alert(
        "이전 권한과 동일한 권한을 선택했습니다. 다른 권한을 선택해주세요."
      );
      return;
    }

    const requestData: UserRoleUpdate = {
      nickname: userData.nickname,
      newRole: newRole.type,
    };

    const response = await AdminRepository.postRole(
      requestData,
      undefined,
      undefined
    );
    if (response.success) {
      window.alert("권한을 변경했습니다.");
      updateRole(newRole);
      handleCancel();
      return;
    }
    const error = response.error;
    if (error && error.message) {
      setGlobalError(error.message);
      return;
    }
    if (error && error.bindingErrors.length > 0) {
      const bindingError = error.bindingErrors[0];
      setGlobalError(bindingError.defaultMessage);
    }
  };

  return (
    <>
      <Modal
        title="권한 변경"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        cancelText="취소"
        okText="변경"
      >
        <Divider />
        <Form>
          <Form.Item
            label="현재 권한"
            name="prevRole"
            initialValue={userData.role.kr}
          >
            <Input value={userData.role.kr} type="text" disabled />
          </Form.Item>
          <Form.Item label="새 권한" name="newRole">
            <Dropdown
              menu={{
                items,
                selectable: true,
                defaultSelectedKeys: [userData.role.id.toString()],
                onClick: handleMenuClick,
              }}
              className={styles.inLineBlock}
            >
              <Button>
                <Space>
                  {newRole ? newRole.kr : "선택"}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </Form.Item>
          {globalError ? (
            <Form.Item style={{ margin: 0 }}>
              <Typography.Text type="danger">{globalError}</Typography.Text>
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
      <Button onClick={showModal}>수정</Button>
    </>
  );
};

export default UpdateRole;
