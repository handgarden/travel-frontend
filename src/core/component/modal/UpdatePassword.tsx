import { Button, Divider, Form, Input, Modal, Typography } from "antd";
import useModalState from "../../hook/useModalState";
import { useForm } from "antd/es/form/Form";
import { passwordRules } from "../../../lib/validation/rule/validation.rule";
import { validationMessages } from "../../../lib/validation/validation.message";
import { validationStatusConst } from "../../../lib/const/form/validation";
import { ChangeEvent, useState } from "react";
import { ValidationStatus } from "../../../types/form/validation.type";
import { useNavigate } from "react-router-dom";
import useRepository from "../../hook/useRepository";
import { UpdatePasswordForm } from "../../../types/User.type";
import {
  SERVER_ERROR_MESSAGE,
  VALIDATION_MESSAGE,
  WRONG_MESSAGE,
} from "../../../lib/func/message";

type FormData = {
  prevPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  logout: () => void;
};

const UpdatePassword: React.FC<Props> = ({ logout }) => {
  const { isModalOpen, handleCancel, showModal } = useModalState();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(
    validationStatusConst.DEFAULT
  );
  const [help, setHelp] = useState<string>("");

  const validatePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    setPassword(password);
    if (confirmPassword.length > 0) {
      if (password === confirmPassword) {
        setValidationStatus(validationStatusConst.SUCCESS);
        setHelp("");
      } else {
        setValidationStatus(validationStatusConst.ERROR);
        setHelp("입력하신 비밀번호와 다릅니다.");
      }
    }
  };

  const validateConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = event.target.value;
    setConfirmPassword(confirmPassword);
    if (password === confirmPassword) {
      setValidationStatus(validationStatusConst.SUCCESS);
      setHelp("");
    } else {
      setValidationStatus(validationStatusConst.ERROR);
      setHelp("입력하신 비밀번호와 다릅니다.");
    }
  };

  const [globalError, setGlobalError] = useState<string>("");

  const [form] = useForm<FormData>();

  const navigate = useNavigate();

  const { UserRepository, AuthRepository } = useRepository();

  const handelOk = async () => {
    try {
      const data = await form.validateFields();
      //비밀번호 확인이 틀린 경우
      if (validationStatus === validationStatusConst.ERROR) {
        return;
      }
      const requestData: UpdatePasswordForm = {
        prevPassword: data.prevPassword,
        newPassword: data.newPassword,
      };
      const response = await UserRepository.postPassword(requestData);
      if (!response.success) {
        const error = response.error;

        if (!error || error.status !== 400) {
          setGlobalError(SERVER_ERROR_MESSAGE);
          return;
        }

        const message = error.message;

        if (message.includes("newPassword")) {
          setGlobalError(VALIDATION_MESSAGE("새 비밀번호를"));
          return;
        }

        setGlobalError(WRONG_MESSAGE("현재 비밀번호를"));
        return;
      }
      //변경 성공
      //성공 알림 띄우고 로그아웃 처리하고 로그인 페이지로 이동
      window.alert(
        "비밀번호를 성공적으로 변경했습니다. 새 비밀번호로 다시 로그인해주세요."
      );
      await AuthRepository.postLogout();
      logout();
      navigate("/login");
    } catch (e) {}
  };

  return (
    <>
      <Modal
        open={isModalOpen}
        title="비밀번호 수정"
        onCancel={handleCancel}
        onOk={handelOk}
        cancelText="취소"
        okText="변경"
      >
        <Divider />
        <Form form={form} validateMessages={validationMessages}>
          <Form.Item
            name="prevPassword"
            label="이전 비밀번호"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="새 비밀번호"
            rules={passwordRules}
          >
            <Input.Password onChange={validatePassword} />
          </Form.Item>
          <Form.Item
            label="새 비밀번호 확인"
            name="confirmPassword"
            validateStatus={validationStatus}
            help={help}
            rules={[{ required: true }]}
          >
            <Input.Password onChange={validateConfirmPassword} />
          </Form.Item>
          {globalError ? (
            <Form.Item style={{ margin: 0 }}>
              <Typography.Text type="danger">{globalError}</Typography.Text>
            </Form.Item>
          ) : null}
        </Form>
      </Modal>{" "}
      <Button onClick={showModal}>수정</Button>
    </>
  );
};

export default UpdatePassword;
