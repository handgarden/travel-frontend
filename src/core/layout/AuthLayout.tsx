import React from "react";
import styles from "./AuthLayout.module.scss";
import { Layout } from "antd";
import DefaultIcon from "../component/DefaultIcon";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <header>
        <div className={styles.headerBlock}>
          <DefaultIcon />
        </div>
      </header>
      <Layout.Content>
        <div className={styles.contentBlock}>
          <Outlet />
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default AuthLayout;
