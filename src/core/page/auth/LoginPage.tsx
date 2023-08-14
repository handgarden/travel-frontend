import { LoginForm } from "../../component/LoginForm";
import RegisterLinkButton from "../../component/link/RegisterLinkButton";
import AuthLayout from "../../layout/AuthLayout";
import styles from "./scss/LoginPage.module.scss";

const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <>
        <LoginForm itemSize={styles.itemBlock} />
        <RegisterLinkButton className={styles.itemBlock} />
      </>
    </AuthLayout>
  );
};

export default LoginPage;
