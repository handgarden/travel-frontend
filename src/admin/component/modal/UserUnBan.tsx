import { Button, Divider, Modal, Typography } from "antd";
import useModalState from "../../../core/hook/useModalState";
import useRepository from "../../../core/hook/useRepository";
import { useState } from "react";

type Props = {
  unbanNickname: string;
  unbanUser: () => void;
};

const UserUnBan: React.FC<Props> = ({ unbanNickname, unbanUser }) => {
  const { isModalOpen, showModal, handleCancel } = useModalState();

  const banText = "정지 해제";

  const confirmText = `정말로 계정을 ${banText}하시겠습니까?`;

  const [globalError, setGlobalError] = useState<string>("");

  const { AdminRepository } = useRepository();

  const handleOk = async () => {
    const response = await AdminRepository.postUnban(
      undefined,
      unbanNickname,
      undefined
    );
    if (response.success) {
      window.alert("계정을 정지 해제 했습니다.");
      handleCancel();
      unbanUser();
      return;
    }
    const error = response.error;
    if (error && error.message) {
      setGlobalError(error.message);
    } else {
      setGlobalError("서버에 문제가 있습니다.");
    }
  };
  return (
    <>
      <Modal
        title={banText}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        cancelText="취소"
        cancelButtonProps={{ danger: true }}
        okText={banText}
        okButtonProps={{ danger: true }}
      >
        <Typography.Text type="danger">{confirmText}</Typography.Text>
        {globalError ? (
          <>
            <Divider />
            <Typography.Text type="danger">{globalError}</Typography.Text>
          </>
        ) : null}
      </Modal>
      <Button onClick={showModal} danger>
        {banText}
      </Button>
    </>
  );
};

export default UserUnBan;
