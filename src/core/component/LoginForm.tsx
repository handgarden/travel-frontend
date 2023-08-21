import { Button, Divider, Form, Input, InputRef, Typography } from "antd";
import { useCallback, useContext, useRef, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import useRepository from "../hook/useRepository";
import { LoginResponse } from "../../types/Auth.type";

type Props = {
  itemSize?: string;
};

export const LoginForm: React.FC<Props> = ({ itemSize }) => {
  const account = useRef<InputRef>(null);
  const rawPassword = useRef<InputRef>(null);

  const [globalError, setGlobalError] = useState<string>("");

  const [form] = Form.useForm();

  const { login } = useContext(AuthContext);

  const location = useLocation();

  const query = location.search.replace("?redirect=", "");

  const { AuthRepository } = useRepository();

  const [loading, setLoading] = useState<boolean>(false);

  form.submit = useCallback(async () => {
    const loginData = {
      account: account.current?.input ? account.current.input.value : "",
      password: rawPassword.current?.input
        ? rawPassword.current.input.value
        : "",
    };

    if (loginData.account.length < 4 || loginData.password.length < 8) {
      setGlobalError("가입되지 않은 회원이거나 잘못된 암호를 입력하셨습니다.");
      return;
    }

    setLoading(true);
    const userData = await AuthRepository.postLogin(loginData);
    setLoading(false);

    if (userData.success) {
      const data = userData.response as LoginResponse;
      const redirect = query ? query : "/";
      login(data, redirect);
      return;
    }

    const errorData = userData.error;
    if (errorData && errorData.status === 400) {
      setGlobalError("가입되지 않은 회원이거나 잘못된 암호를 입력하셨습니다.");
      return;
    }

    setGlobalError("서버에서 오류가 발생했습니다.");
  }, [AuthRepository, login, query]);

  return (
    <Form form={form} name="login" layout="vertical">
      <Form.Item label="계정:" name="account">
        <Input ref={account} className={itemSize} />
      </Form.Item>
      <Form.Item label="비밀번호:" name="password">
        <Input.Password ref={rawPassword} className={itemSize} />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className={itemSize}
          loading={loading}
        >
          로그인
        </Button>
      </Form.Item>
      {globalError === "" ? null : (
        <Form.Item style={{ margin: 0 }}>
          <Typography.Text type="danger">{globalError}</Typography.Text>
        </Form.Item>
      )}
      <Divider />
    </Form>
  );
};
