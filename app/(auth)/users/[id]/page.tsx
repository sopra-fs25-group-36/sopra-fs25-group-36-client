"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Typography, Modal, Form, Input, App, message } from "antd";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";
import { Lobby } from "@/types/lobby";
import Logo from "@/components/Logo";
import AnimatedLineChart from "@/components/AnimatedLineChart";
import BarChartComponent from "@/components/BarChartComponent";
import PieChartComponent from "@/components/PieChartComponent";

const { Title } = Typography;

// Dummy player data
const dummyPlayer = {
  userId: 42,
  cashBalance: 3200,
  stocks: [
    { symbol: "AAPL", quantity: 10, category: "Tech", currentPrice: 160 },
    { symbol: "XOM", quantity: 8, category: "Energy", currentPrice: 110 },
    { symbol: "JPM", quantity: 5, category: "Finance", currentPrice: 130 },
    { symbol: "PFE", quantity: 12, category: "Healthcare", currentPrice: 45 },
    { symbol: "PG", quantity: 3, category: "Consumer", currentPrice: 150 },
  ],
  transactionHistory: [
    { stockId: "AAPL", quantity: 5, price: 155, type: "BUY" },
    { stockId: "XOM", quantity: 3, price: 108, type: "BUY" },
    { stockId: "AAPL", quantity: 2, price: 162, type: "SELL" },
  ],
};

// Dummy datasets for AnimatedLineChart
const datasets = [
  {
    label: "AAPL",
    data: [10.5, 7.02, 9, 5.11, 8, 3, 4, 2.12, 5.243, 12.1],
  },
  {
    label: "JNJ",
    data: [100.5, 100.1, 99.2, 101.2, 90.3, 95.5, 99.01, 17.44, 70.243, 71.22],
  },
  {
    label: "GOOGL",
    data: [50, 48, 52, 53, 51, 47, 50, 45, 43, 44],
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { id: userId } = useParams();
  const apiService = useApi();
  const { isAuthenticated, isLoading } = useAuth();
  const [isJoinGameModalVisible, setIsJoinGameModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const inputRef = useRef<any>(null);

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

  // Prepare data for Pie and Bar charts
  const categoryTotals: Record<string, number> = {};
  dummyPlayer.stocks.forEach((stock) => {
    const value = stock.currentPrice * stock.quantity;
    categoryTotals[stock.category] =
      (categoryTotals[stock.category] || 0) + value;
  });

  const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
    type: category.trim(),
    value,
  }));

  const barData = dummyPlayer.stocks
    .map((stock) => ({
      name: stock.symbol,
      value: stock.currentPrice * stock.quantity,
      category: stock.category,
    }))
    .sort((a, b) => b.value - a.value);

  const categoryColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
  };

  return (
    <App>
      <div style={{ maxWidth: 400, margin: "20px auto", padding: 2 }}>
        <Logo />
        <br />
        <Title level={2} style={{ textAlign: "center" }}>
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
      </div>

      <Modal
        title="Join a Game"
        open={isJoinGameModalVisible}
        onCancel={handleJoinGameCancel}
        footer={[
          <Button key="cancel" onClick={handleJoinGameCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleJoinGameSubmit}>
            Join Game
          </Button>,
        ]}
      >
        <Form form={form}>
          <Form.Item
            name="gameCode"
            label="Enter Game Code"
            rules={[{ required: true, message: "Please input the game code!" }]}
          >
            <Input ref={inputRef} />
          </Form.Item>
        </Form>
      </Modal>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <AnimatedLineChart datasets={datasets} />
        </div>
        <div style={{ height: "200px" }}>
          <PieChartComponent
            data={pieData}
            colorMap={{
              Tech: "#1890ff",
              Finance: "#52c41a",
              Healthcare: "#faad14",
              Energy: "#f5222d",
              Consumer: "#722ed1",
            }}
          />
        </div>
        <div style={{ height: "200px" }}>
          <BarChartComponent data={barData} colorMap={categoryColorMap} />
        </div>
      </section>
    </App>
  );
}
