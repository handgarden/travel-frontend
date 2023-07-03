import {
  Button,
  Layout,
  Menu,
  MenuProps,
  Space,
  Typography,
  theme,
} from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { destinationPath, journeyPath } from "../router/path";
import { getItem } from "../../lib/func/menu";
import {
  FlightTakeoff,
  ModeOfTravel,
  Restaurant,
  LocalHotel,
  Kayaking,
  Map,
} from "@mui/icons-material";
import { UnorderedListOutlined } from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import { CATEGORY } from "../../lib/const/category";
import styles from "./Sidebar.module.scss";
import Navbar from "../component/MemberNavbar";
import DefaultIcon from "../component/DefaultIcon";
import { Footer } from "antd/es/layout/layout";

const defaultIcon = [<LocalHotel />, <Restaurant />, <Kayaking />, <Map />];

const defaultItems: MenuProps["items"] = [
  getItem("여행지", "destination", <FlightTakeoff />, [
    getItem(<Link to="/">{"전체"}</Link>, "1", <FlightTakeoff />),
    ...Object.values(CATEGORY)
      .slice(0)
      .map((c, i) =>
        getItem(
          <Link to={destinationPath[c.type]}>{c.kr}</Link>,
          c.type.toLowerCase(),
          defaultIcon[i]
        )
      ),
  ]),
  getItem(
    <Link to={journeyPath.HOME}>{"여정"}</Link>,
    "journey",
    <ModeOfTravel />
  ),
];

const DefaultMenu: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[2];
  return (
    <Menu
      items={defaultItems}
      defaultOpenKeys={["destination"]}
      defaultSelectedKeys={path ? [path] : ["1"]}
      style={{ height: "100%", width: "100%" }}
      mode="inline"
    />
  );
};

const DefaultLayout: React.FC = () => {
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
          <Navbar breakPoint={breakPoint} />
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
          <DefaultMenu />
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
          <DefaultMenu />
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
      <Footer>
        <Typography.Paragraph style={{ fontSize: ".75rem" }}>
          {"여행지 데이터와 사진의 출처는 ("}
          <Link to="https://api.visitkorea.or.kr/#/" target="_blank">
            한국관광공사
          </Link>
          {")와 ("}
          <Link to="https://www.data.go.kr/index.do" target="_blank">
            공공데이터
          </Link>
          {")입니다."}
        </Typography.Paragraph>
        <Typography.Paragraph style={{ fontSize: ".75rem" }}>
          {
            "혹시나 사용에 문제가 있다면 sjungwon03@gmail.com 메일로 연락주세요."
          }
        </Typography.Paragraph>
      </Footer>
    </Layout>
  );
};

export default DefaultLayout;
