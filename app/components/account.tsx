"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Dropdown, MenuProps, message, Button, Tooltip } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";

const Account = () => {
  const router = useRouter();
  const userId = localStorage.getItem("id");
  const apiService = useApi();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data: currentUser } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await apiService.get<User>(`/users/${userId}`);
      if (!response) throw new Error("No user data received");
      return response;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!isAuthenticated && !!userId,
  });

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("No authentication token found");
        throw new Error("No token found");
      }
      const hideLoading = message.loading("Logging out...", 0);

      await apiService.post(
        `/users/${userId}/logout`,
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      );

      queryClient.clear();
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      hideLoading();
      message.success("Logged out successfully!");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (error) {
      console.error("Logout failed:", error);
      // message.error("Logout failed. You have been logged out locally.");
      localStorage.removeItem("token");
      localStorage.removeItem("id");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "edit",
      label: "Back to Menu",
      icon: <EditOutlined />,
      onClick: () => router.push(`/users/${userId}`),
    },
    {
      key: "instructions",
      label: "Instructions",
      icon: <FileTextOutlined />,
      onClick: () => router.push(`/instructions`),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
      <Tooltip>
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight"
          overlayStyle={{
            position: "fixed",
            minWidth: "200px",
          }}
        >
          <Button
            type="text"
            icon={
              <Avatar
                size={50}
                src={currentUser?.avatar}
                icon={!currentUser?.avatar && <UserOutlined />}
              />
            }
          />
        </Dropdown>
      </Tooltip>
    </div>
  );
};

export default Account;
