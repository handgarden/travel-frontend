import { Button, Divider, Form, Input, Modal, Typography } from "antd";
import { useState } from "react";
import { nicknameRules } from "../../../lib/validation/rule/validation.rule";
import { validationMessages } from "../../../lib/validation/validation.message";
import useModalState from "../../hook/useModalState";
import {
  BASIC_SUCCESS_MESSAGE,
  ResponseTemplate,
} from "../../../types/repository/basic.type";
import {
  MemberBasicProfile,
  UpdateNicknameForm,
} from "../../../types/User.type";

type Props = {
  userData: MemberBasicProfile;
  postNickname: (
    data: UpdateNicknameForm
  ) => Promise<ResponseTemplate<BASIC_SUCCESS_MESSAGE>>;
  updateNickname: (newNickname: string) => void;
};

type NicknameData = {
  prevNickname: string;
  newNickname: string;
};

const UpdateNickname: React.FC<Props> = ({
  userData,
  updateNickname,
  postNickname,
}) => {
  const { isModalOpen, setIsModalOpen, handleCancel, showModal } =
    useModalState();

  const [globalError, setGlobalError] = useState<string>("");

  const [form] = Form.useForm<NicknameData>();

  const handleOk = async () => {
    try {
      const formData = await form.validateFields();
      if (formData.newNickname === formData.prevNickname) {
        window.alert("동일한 닉네임을 작성했습니다. 다시 작성해주세요.");
        return;
      }
      const data: UpdateNicknameForm = {
        nickname: formData.newNickname,
      };
      const response = await postNickname(data);

      if (!response.success) {
        const error = response.error;
        if (error && error.message) {
          setGlobalError(error.message);
        } else {
          if (error && error.bindingErrors.length > 0) {
            setGlobalError(error.bindingErrors[0].defaultMessage);
          }
        }
        return;
      } else {
        setGlobalError("");
      }

      window.alert("닉네임을 성공적으로 변경했습니다.");
      updateNickname(formData.newNickname);
      form.setFieldValue("prevNickname", formData.newNickname);
      form.setFieldValue("newNickname", "");

      setIsModalOpen(false);
    } catch (e) {}
  };

  return (
    <>
      <Modal
        title="닉네임 변경"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        cancelText="취소"
        okText="변경"
      >
        <Divider />
        <Form form={form} validateMessages={validationMessages}>
          <Form.Item
            label="현재 닉네임"
            name="prevNickname"
            initialValue={userData.nickname}
          >
            <Input value={userData.nickname} type="text" disabled />
          </Form.Item>
          <Form.Item
            label="변경할 닉네임"
            name="newNickname"
            rules={nicknameRules}
          >
            <Input type="text" />
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

export default UpdateNickname;
