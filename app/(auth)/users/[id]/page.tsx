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
import AnimatedLineChart from "@/components/AnimatedLineChart";

const { Title } = Typography;

const datasets = [
  {
    label: "AAPL",
    data: [10.5, 7.02, 9, 5.11, 8, 3, 4, 2.12, 5.243, 12.1],
  },
  // {
  //   label: "JNJ",
  //   data: [100.5, 100.1, 99.2, 101.2, 90.3, 95.5, 99.01, 17.44, 70.243, 71.22],
  // },
  // {
  //   label: "GOOGL",
  //   data: [50, 48, 52, 53, 51, 47, 50, 45, 43, 44],
  // },
];

// const datasets = [
//   {
//     label: "AAPL", // Apple
//     data: [145.32, 147.85, 149.65, 148.35, 146.72, 145.90, 144.80, 143.50, 141.85, 142.40],
//   },
//   {
//     label: "GOOGL", // Google
//     data: [2725.60, 2750.35, 2770.10, 2780.50, 2755.85, 2738.90, 2720.20, 2700.15, 2695.55, 2705.45],
//   },
//   {
//     label: "AMZN", // Amazon
//     data: [3470.10, 3505.50, 3520.75, 3510.80, 3490.30, 3470.10, 3450.60, 3435.55, 3415.75, 3430.65],
//   },
//   {
//     label: "MSFT", // Microsoft
//     data: [299.25, 301.15, 303.60, 302.45, 300.10, 299.50, 298.30, 296.80, 295.65, 296.75],
//   },
//   {
//     label: "TSLA", // Tesla
//     data: [685.15, 690.75, 695.30, 692.85, 690.10, 688.00, 685.90, 682.50, 680.35, 681.45],
//   },
//   {
//     label: "NFLX", // Netflix
//     data: [635.40, 640.80, 645.30, 643.70, 642.15, 639.50, 637.20, 635.10, 634.00, 635.85],
//   },
//   {
//     label: "FB", // Facebook
//     data: [355.20, 358.90, 360.15, 359.10, 358.35, 357.05, 356.15, 355.60, 353.90, 355.00],
//   },
//   {
//     label: "NVDA", // Nvidia
//     data: [219.60, 222.80, 225.15, 224.40, 223.05, 221.90, 220.60, 219.25, 218.50, 220.80],
//   },
//   {
//     label: "SPY", // SPDR S&P 500 ETF Trust
//     data: [450.10, 455.75, 457.20, 459.30, 455.50, 452.80, 451.10, 449.80, 448.90, 450.50],
//   },
//   {
//     label: "DIS", // Disney
//     data: [183.60, 185.45, 187.80, 188.20, 187.15, 185.90, 184.50, 182.75, 181.60, 182.40],
//   },
// ];

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
      <section>
        <AnimatedLineChart datasets={datasets} />
      </section>
    </App>
  );
};

export default Dashboard;
