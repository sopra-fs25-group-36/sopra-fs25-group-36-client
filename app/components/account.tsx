"use client";

import { Avatar, Dropdown, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { App } from "antd";

const Account = () => {
  const { message } = App.useApp();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    message.success("Logged out successfully");
    router.push("/login");
  };

  const menuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button
        type="text"
        style={{
          padding: 0,
          position: "absolute",
          top: 20,
          right: 20,
        }}
      >
        <Avatar
          size="large"
          style={{
            backgroundColor: "#11e098",
            cursor: "pointer",
          }}
        />
      </Button>
    </Dropdown>
  );
};

export default Account;
