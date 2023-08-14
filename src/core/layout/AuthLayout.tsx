import React from "react";
import styles from "./AuthLayout.module.scss";
import { Layout } from "antd";
import DefaultIcon from "../component/DefaultIcon";
import { ChildFC } from "../../types/Basic.type";

const AuthLayout: ChildFC = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <header>
        <div className={styles.headerBlock}>
          <DefaultIcon />
        </div>
      </header>
      <Layout.Content>
        <div className={styles.contentBlock}>{children}</div>
      </Layout.Content>
    </Layout>
  );
};

export default AuthLayout;
