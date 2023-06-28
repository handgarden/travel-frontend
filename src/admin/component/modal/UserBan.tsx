import { Button, Divider, Form, Modal, Typography } from "antd";
import { useState } from "react";
import useModalState from "../../../core/hook/useModalState";
import useRepository from "../../../core/hook/useRepository";
import MyEditor from "../editor/MyEditor";
import { MemberProfile } from "../../../types/User.type";
import { UserBanRequest } from "../../../types/Admin.type";
import { useAuth } from "../../../context/AuthContext";

type Props = {
  user: MemberProfile;
  banUser: () => void;
};

const UserBan: React.FC<Props> = ({ user, banUser }) => {
  const { isModalOpen, showModal, handleCancel } = useModalState();

  const banText = "정지";

  const confirmText = `정말로 계정을 ${banText}하시겠습니까?`;

  const [description, setDescription] = useState<string>("");

  const [charCount, setCharCount] = useState<number>(0);

  const [globalError, setGlobalError] = useState<string>("");

  const { AdminRepository } = useRepository();

  const { user: loginUser } = useAuth();

  const handleOk = async () => {
    if (charCount < 20) {
      setGlobalError("20자 이상 입력해주세요.");
      return;
    } else if (charCount > 200) {
      setGlobalError("200자 이하로 작성해주세요.");
      return;
    } else {
      setGlobalError("");
    }
    const data: UserBanRequest = {
      nickname: user.nickname,
      description: description,
    };

    const response = await AdminRepository.postBan(data, undefined, undefined);
    if (!response.success) {
      const error = response.error;
      if (error && error.message) {
        setGlobalError(error.message);
        return;
      }
      if (error && error.bindingErrors.length > 0) {
        const bindingError = error.bindingErrors[0];
        setGlobalError(bindingError.defaultMessage);
        return;
      }
      return;
    }

    window.alert("사용자를 정지했습니다.");
    handleCancel();
    banUser();
  };

  return (
    <>
      <Modal
        title="계정 정지"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        cancelText="취소"
        cancelButtonProps={{ danger: true }}
        okText={banText}
        okButtonProps={{ danger: true }}
      >
        <Divider />
        <Typography.Title level={5}>
          {"정지 계정: " + user.account}
        </Typography.Title>
        <Divider />
        <Form layout="vertical">
          <Form.Item label="정지 사유:">
            <MyEditor setValue={setDescription} setCharCount={setCharCount} />
          </Form.Item>
          {globalError ? (
            <Form.Item>
              <Typography.Text type="danger">{globalError}</Typography.Text>
            </Form.Item>
          ) : null}
        </Form>
        <Divider />
        <Typography.Text type="danger">{confirmText}</Typography.Text>
      </Modal>
      <Button
        onClick={showModal}
        danger
        disabled={user.nickname === loginUser?.nickname}
      >
        {banText}
      </Button>
    </>
  );
};

export default UserBan;
