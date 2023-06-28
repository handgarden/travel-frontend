import { LoginForm } from "../../component/LoginForm";
import RegisterLinkButton from "../../component/link/RegisterLinkButton";
import styles from "./scss/LoginPage.module.scss";

const LoginPage: React.FC = () => {
  return (
    <>
      <LoginForm itemSize={styles.itemBlock} />
      <RegisterLinkButton className={styles.itemBlock} />
    </>
  );
};

export default LoginPage;
