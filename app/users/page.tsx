"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { Button, Typography, Modal, Form, Input, App } from "antd";
import Logo from "@/components/Logo";
import { User } from "@/types/user";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { isAuthenticated, isLoading } = useAuth();
  const [isJoinGameModalVisible, setIsJoinGameModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("id") : null;

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (userId && userId !== "0") {
        try {
          const userData = await apiService.get<User>(`/users/${userId}`);
          if (userData) {
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchCurrentUser();
  }, [userId, apiService]);

  // Handle logout
  const handleLogout = async () => {
    try {
      if (userId) {
        // Call the logout endpoint with an empty object as the body
        await apiService.post(`/logout/${userId}`, {});
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Remove user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("id");

      // Redirect the user to the login page
      router.push("/login");
    }
  };

  // Show modal to join a game
  const showJoinGameModal = () => {
    setIsJoinGameModalVisible(true);
  };

  // Cancel modal to join a game
  const handleJoinGameCancel = () => {
    setIsJoinGameModalVisible(false);
    form.resetFields();
  };

  // Submit modal to join a game
  const handleJoinGameSubmit = () => {
    const code = form.getFieldValue("gameCode");
    if (code) {
      router.push(`/join-game?code=${encodeURIComponent(code)}`);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <App>
      <div style={{ maxWidth: 400, margin: "20px auto", padding: 2 }}>
        <Logo />
        <br />
        <Title level={2} style={{ textAlign: "center" }}>
          {currentUser ? `Welcome, ${currentUser.username}!` : "Welcome!"}
        </Title>
        <br />
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Button
            type="primary"
            onClick={() => router.push("/new-game")}
            block
            style={{ height: "60px", fontSize: "20px" }}
          >
            New Game
          </Button>
          <Button
            type="primary"
            onClick={showJoinGameModal}
            block
            style={{ height: "60px", fontSize: "20px" }}
          >
            Join Game
          </Button>
          <Button
            type="default"
            onClick={handleLogout}
            block
            style={{ height: "60px", fontSize: "20px" }}
          >
            Logout
          </Button>
        </div>

        <Modal
          title="Enter Game Code"
          open={isJoinGameModalVisible}
          onOk={handleJoinGameSubmit}
          onCancel={handleJoinGameCancel}
          okText="Join Game"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="gameCode"
              label="Game Code"
              rules={[
                { required: true, message: "Please enter the game code" },
              ]}
            >
              <Input placeholder="Enter the game code" size="large" autoFocus />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </App>
  );
};

export default Dashboard;
