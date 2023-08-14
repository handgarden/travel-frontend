import RegisterForm from "../../component/RegisterForm";
import AuthLayout from "../../layout/AuthLayout";
import styles from "./scss/RegisterPage.module.scss";

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout>
      <RegisterForm itemSize={styles.itemBlock} />
    </AuthLayout>
  );
};

export default RegisterPage;
