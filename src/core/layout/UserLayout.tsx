import {
  UserOutlined,
  ReadOutlined,
  CreditCardOutlined,
  DollarOutlined,
  AuditOutlined,
  UnorderedListOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import {
  CommentOutlined,
  EditOutlined,
  FlightTakeoff,
  ModeOfTravel,
} from "@mui/icons-material";
import { Button, Layout, Menu, MenuProps, Space, theme } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { getItem } from "../../lib/func/menu";
import { userPath } from "../router/path";
import MemberNavbar from "../component/MemberNavbar";
import Sider from "antd/es/layout/Sider";
import styles from "./Sidebar.module.scss";
import DefaultIcon from "../component/DefaultIcon";

const UserMenu: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  const items: MenuProps["items"] = useMemo(() => {
    const arr = [
      getItem(
        <Link to={userPath.PROFILE}>{"프로필"}</Link>,
        "user",
        <UserOutlined />
      ),
      getItem(
        <Link to={userPath.PAYMENT_METHOD}>{"결제수단"}</Link>,
        "payment",
        <CreditCardOutlined />
      ),
      getItem(
        <Link to={userPath.ORDER}>{"결제내역"}</Link>,
        "order",
        <DollarOutlined />
      ),
      getItem(
        <Link to={userPath.SALES}>{"판매내역"}</Link>,
        "sales",
        <AuditOutlined />
      ),
      getItem("작성글", "resource", <EditOutlined />, [
        getItem(
          <Link to={userPath.DESTINATION}>{"여행지"}</Link>,
          "destination",
          <FlightTakeoff />
        ),
        getItem(
          <Link to={userPath.DESCRIPTION}>{"후기"}</Link>,
          "description",
          <ReadOutlined />
        ),
        getItem(
          <Link to={userPath.JOURNEY}>{"여정"}</Link>,
          "journey",
          <ModeOfTravel />
        ),
        getItem(
          <Link to={userPath.COMMENT}>{"댓글"}</Link>,
          "comment",
          <CommentOutlined />
        ),
      ]),
    ];
    return arr;
  }, []);

  return (
    <Menu
      items={items}
      defaultOpenKeys={["resource"]}
      defaultSelectedKeys={!path || path === "profile" ? ["user"] : [path]}
      style={{ height: "100%" }}
      mode="inline"
    />
  );
};

const UserLayout: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [breakPoint, setBreakPoint] = useState<boolean>(false);

  const path = useLocation().pathname;
  useEffect(() => {
    setHideTopBar(true);
  }, [path]);

  const [hideTopBar, setHideTopBar] = useState<boolean>(true);

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <Layout.Header
        style={{
          background: colorBgContainer,
          position: "relative",
          padding: "0 1rem",
        }}
      >
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          {breakPoint ? (
            <Button onClick={() => setHideTopBar((prev) => !prev)}>
              <UnorderedListOutlined />
            </Button>
          ) : null}
          <DefaultIcon />
          <MemberNavbar breakPoint={breakPoint} />
        </Space>
        <div
          style={{
            position: "absolute",
            left: "0",
            width: "100%",
            zIndex: "10",
          }}
          className={hideTopBar ? styles.topbar_hide : undefined}
        >
          <UserMenu />
        </div>
      </Layout.Header>
      <Layout style={{ marginTop: "1rem" }}>
        <Sider
          style={{ background: colorBgContainer }}
          breakpoint="md"
          onBreakpoint={(b) => {
            setBreakPoint(b);
          }}
          className={breakPoint ? styles.hide : undefined}
        >
          <UserMenu />
        </Sider>
        <Layout>
          <Layout.Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
            }}
          >
            <div
              style={{
                maxWidth: 1000,
                margin: "0 auto",
              }}
            >
              <Outlet />
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
