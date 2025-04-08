"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Typography, Modal, Form, Input, App, message } from "antd";
import type { InputRef } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";
import { Lobby } from "@/types/lobby";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { id: userId } = useParams();
  const apiService = useApi();
  const { isAuthenticated, isLoading } = useAuth();
  const [isJoinGameModalVisible, setIsJoinGameModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isJoinGameModalVisible) {
      // Short delay ensures modal is rendered before focus
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isJoinGameModalVisible]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) return;
        const user = await apiService.get<User>(`/users/${userId}`);
        setCurrentUser(user);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, [userId, apiService]);

  // Handle creating a new lobby
  const handleCreateNewRoom = async () => {
    try {
      const newLobby = await apiService.post<Lobby>(
        `/${userId}/createLobby`,
        {}
      );
      if (newLobby && newLobby.id) {
        router.push(`/lobby/${newLobby.id}`);
      } else {
        message.error("Failed to create lobby");
      }
    } catch (error) {
      console.error("Error creating lobby:", error);
      message.error("Error creating lobby");
    }
  };

  // Show join game modal
  const showJoinGameModal = () => {
    setIsJoinGameModalVisible(true);
  };

  // Cancel join game modal
  const handleJoinGameCancel = () => {
    setIsJoinGameModalVisible(false);
    form.resetFields();
  };

  // Submit join game modal
  const handleJoinGameSubmit = async () => {
    try {
      const lobbyId = form.getFieldValue("gameCode");
      if (!lobbyId) {
        message.error("Please enter a game code");
        return;
      }
      // Post to the joinLobby endpoint using lobbyCode as the lobby id.
      const targetLobby = await apiService.post<Lobby>(
        `/${lobbyId}/joinLobby`,
        {
          userId: Number(userId),
        }
      );
      if (targetLobby && targetLobby.id && targetLobby.active) {
        router.push(`/lobby/${targetLobby.id}`);
      } else {
        console.error("Failed to join lobby, the lobby is no longer valid");
      }
    } catch (error) {
      console.error("Error joining lobby:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    router.push("/login");
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
        {/* <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}> */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          <Button
            type="primary"
            onClick={handleCreateNewRoom}
            block
            style={{ height: "50px" }}
          >
            Create Game
          </Button>
          <Button
            type="primary"
            onClick={showJoinGameModal}
            block
            style={{ height: "50px" }}
          >
            Join Game
          </Button>
        </div>

        <Modal
          title="Enter Game Code"
          open={isJoinGameModalVisible}
          onOk={handleJoinGameSubmit}
          onCancel={handleJoinGameCancel}
          okText="Join Game"
          cancelButtonProps={{ style: { display: "none" } }}
          keyboard={true}
          closable={true}
          footer={
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="primary"
                onClick={handleJoinGameSubmit}
                style={{ width: "150px" }} // Adjust width as needed
              >
                Join Game
              </Button>
            </div>
          }
        >
          <Form form={form} layout="vertical" onFinish={handleJoinGameSubmit}>
            <Form.Item
              name="gameCode"
              label="Game Code"
              rules={[
                { required: true, message: "Please enter the game code" },
              ]}
            >
              <Input
                ref={inputRef}
                placeholder="Enter the game code"
                size="large"
                onPressEnter={handleJoinGameSubmit}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </App>
  );
};

export default Dashboard;
