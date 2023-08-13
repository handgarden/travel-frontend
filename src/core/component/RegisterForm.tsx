import { Button, Form, Input, Typography } from "antd";
import { ChangeEvent, useState } from "react";
import { ValidationStatus } from "../../types/form/validation.type";
import { validationStatusConst } from "../../lib/const/form/validation";
import { useNavigate } from "react-router-dom";
import useQueryString from "../hook/useQueryString";
import {
  accountRules,
  nicknameRules,
  passwordRules,
} from "../../lib/validation/rule/validation.rule";
import { validationMessages } from "../../lib/validation/validation.message";
import useRepository from "../hook/useRepository";
import { RegisterData } from "../../types/Auth.type";

type Props = {
  itemSize: string;
};

type FormData = {
  confirmPassword: string;
} & RegisterData;

const RegisterForm: React.FC<Props> = ({ itemSize }) => {
  const [globalError, setGlobalError] = useState<string>("");

  const [form] = Form.useForm<FormData>();

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

  const navigate = useNavigate();
  const query = useQueryString();
  const { AuthRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  form.submit = async () => {
    try {
      const formData: FormData = await form.validateFields();
      //비밀번호 확인 틀린 경우
      if (validationStatus === validationStatusConst.ERROR) {
        return;
      }
      const registerData: RegisterData = {
        account: formData.account,
        password: formData.password,
        nickname: formData.nickname,
      };
      setLoading(true);
      const response = await AuthRepository.postRegister(registerData);
      setLoading(false);
      if (response.success) {
        window.alert("회원 가입 성공.");
        let path = query.redirect ? query.redirect.toString() : "/login";
        navigate(path);
        return;
      }

      const error = response.error;
      if (error && error.status >= 500) {
        setGlobalError("서버에 문제가 있습니다. 나중에 다시 시도해주세요.");
        return;
      }

      const bindingErrors = error?.bindingErrors;
      if (bindingErrors && bindingErrors.length > 0) {
        const bindingError = bindingErrors[0];
        if (bindingError.codes == null) {
          setGlobalError(bindingError.defaultMessage);
        }
      }
    } catch (errorInfo) {}
  };

  return (
    <Form
      style={{ maxWidth: 600, margin: "auto" }}
      layout="vertical"
      form={form}
      validateMessages={validationMessages}
    >
      <Form.Item label="계정" name="account" rules={accountRules}>
        <Input className={itemSize} />
      </Form.Item>
      <Form.Item label="비밀번호" name="password" rules={passwordRules}>
        <Input.Password className={itemSize} onChange={validatePassword} />
      </Form.Item>
      <Form.Item
        label="비밀번호 확인"
        name="confirmPassword"
        validateStatus={validationStatus}
        help={help}
        rules={[{ required: true }]}
      >
        <Input.Password
          className={itemSize}
          onChange={validateConfirmPassword}
        />
      </Form.Item>
      <Form.Item label="닉네임" name="nickname" rules={nicknameRules}>
        <Input className={itemSize} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className={itemSize}
          loading={loading}
        >
          회원가입
        </Button>
      </Form.Item>
      {globalError ? (
        <Form.Item style={{ margin: 0 }}>
          <Typography.Text type="danger">{globalError}</Typography.Text>
        </Form.Item>
      ) : null}
    </Form>
  );
};

export default RegisterForm;
