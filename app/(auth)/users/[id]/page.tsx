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

  const showJoinGameModal = () => {
    setIsJoinGameModalVisible(true);
  };

  const handleJoinGameCancel = () => {
    setIsJoinGameModalVisible(false);
    form.resetFields();
  };

  const handleJoinGameSubmit = async () => {
    try {
      const lobbyId = form.getFieldValue("gameCode");
      if (!lobbyId) {
        message.error("Please enter a game code");
        return;
      }
      const targetLobby = await apiService.post<Lobby>(
        `/lobby/${lobbyId}/joinLobby`,
        {
          userId: Number(userId),
        }
      );
      if (targetLobby?.id) {
        router.push(`/lobby/${targetLobby.id}`);
      } else {
        message.error("Failed to join lobby");
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
      <div
        style={{
          maxWidth: 400,
          margin: "20px auto",
          padding: 2,
          textAlign: "center",
        }}
      >
        <Logo />
        <br />
        <Title level={2}>
          {currentUser ? `Welcome, ${currentUser.username}!` : "Welcome!"}
        </Title>
        <br />
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
                style={{ width: "150px" }}
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
