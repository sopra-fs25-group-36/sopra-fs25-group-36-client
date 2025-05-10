"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Dropdown, MenuProps, message, Button, Tooltip } from "antd";
import { UserOutlined, LogoutOutlined, EditOutlined } from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";

const UserAccount = () => {
  const router = useRouter();
  const { id: userId } = useParams();
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
      await apiService.post(`/logout/${userId}`, {});
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Logout failed");
    } finally {
      queryClient.clear();
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      router.push("/login");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "edit",
      label: "Profile",
      icon: <EditOutlined />,
      onClick: () => router.push(`/users/${userId}`),
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
      {/* <Tooltip title={currentUser?.username}> */}
      <Tooltip>
        <Dropdown
          menu={{ items }}
          trigger={["click"]}
          placement="bottomRight" // Add this prop
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

export default UserAccount;
