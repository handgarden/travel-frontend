import { Spin } from "antd";
import styles from "./LoadingPage.module.scss";

const LoadingPage: React.FC = () => {
  return <div className={styles.container}><Spin size="large"/></div>;
};

export default LoadingPage;
