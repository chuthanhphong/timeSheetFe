import { Avatar, MenuProps, Popover } from "antd";
import { BarChartOutlined, ProjectOutlined, ScheduleOutlined, TableOutlined, UnlockFilled, UserOutlined } from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";

import { getRoutes } from "../../utils/helpers";
import logo from "../../assets/logo.png";

const { Content, Sider, Footer } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(label: string, key: string, icon?: React.ReactNode, children?: MenuItem[]) {
  return (
    <Menu.Item style={{ height: "55px" }} key={key}>
      <NavLink to={`/${key}`}>
        <span
          className="icon"
          // style={{
          //   background: page === "billing" ? color : ""
          // }}
        >
          {icon}
        </span>
        <span className="label">{label}</span>
      </NavLink>
    </Menu.Item>
  );
}

function itemRender(route, params, routes, paths) {
  const last = routes.indexOf(route) === routes.length - 1;
  return last ? <span>{route.breadcrumbName}</span> : <Link to={paths.join("/")}>{route.breadcrumbName}</Link>;
}
const menuItem = [
  {
    label: "Dashboard",
    key: "dashboard",
    icon: <BarChartOutlined />
  },
  {
    label: "Timeline",
    key: "timeline",
    icon: <ScheduleOutlined />
  },
  {
    label: "Timesheet",
    key: "timesheet",
    icon: <TableOutlined />
  },
  {
    label: "Project",
    key: "project",
    icon: <ProjectOutlined />
  },
  {
    label: "Employee",
    key: "employee",
    icon: <UserOutlined />
  },
  {
    label: "Rule",
    key: "rule",
    icon: <UnlockFilled />
  }
];
const items: MenuItem[] = [
  // getItem("Dashboard", "dashboard"),
  // getItem("Timeline", "timeline", <ScheduleOutlined />),
  // getItem("Timesheet", "timesheet", <TableOutlined />),
  // getItem("Administrator", "admin", <DatabaseOutlined />, [
  //   getItem("Project", "project", <ProjectOutlined />),
  //   getItem("Employee", "employee", <UserOutlined />),
  //   getItem("Rule", "rule", <ReadOutlined />)
  // ])
];

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  const navigate = useNavigate();
  const routes = getRoutes();
  let { pathname } = useLocation();
  pathname = pathname.replace("/", "");
  return (
    <>
      <Layout style={{ minHeight: "100vh", backgroundColor: "#fff" }} className="layout-dashboard">
        <div className="background-layer"></div>
        <Sider
          style={{ marginLeft: "16px", marginTop: "16px" }}
          width="260"
          theme="light"
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div style={{ height: 32, margin: 16, justifyContent: "center", display: "flex" }}>
            <img src={!collapsed ? logo : "favicon.png"} alt="logo" />
          </div>
          <hr className="divider" />
          <Popover
            content={
              <div>
                <p>Role : manager</p>
                <p>Du : 1.6</p>
              </div>
            }
            title="Nguyễn Văn A"
          >
            <div className="user-profile">
              <Avatar size={36} />
              &nbsp; Nguyễn Văn A
            </div>
          </Popover>

          <hr className="divider" />
          <Menu
            style={{ border: "none" }}
            theme="light"
            defaultSelectedKeys={["dashboard"]}
            mode="inline"
            onClick={({ key }) => navigate(key)}
          >
            {menuItem.map((item) => getItem(item.label, item.key, item.icon))}
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Content style={{ margin: "0 16px" }}>
            <Breadcrumb
              style={{ margin: "16px 0", textTransform: "capitalize", fontSize: "16px", color: "#fff" }}
              itemRender={itemRender}
              routes={routes}
            ></Breadcrumb>
            <div className="ant-page-header-heading">
              <span className="ant-page-header-heading-title" style={{ textTransform: "capitalize" }}>
                {pathname}
              </span>
            </div>
            <div className="ant-page-container-custom" style={{ padding: 24, minHeight: 360, borderRadius: borderRadiusLG }}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
      <Footer style={{ textAlign: "center", backgroundColor: "#fff", padding: "10px 0" }}>
        Copyright ©2023 DU6 Team. All rights reserved.
      </Footer>
    </>
  );
};

export default AppLayout;
