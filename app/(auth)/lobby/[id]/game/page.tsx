"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { App as AntApp, Typography } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import Portfolio from "@/components/Portfolio";
// import { User } from "@/types/user";

const { Title, Text } = Typography;

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

// Interface for game details including timing info.
interface GameDetail {
  createdAt: string; // e.g., "2025-04-12T14:00:00Z"
  timeLimitSeconds: number; // e.g., 120 for a 2-minute countdown
}
const GamePage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  //const { id } = useParams(); // Retrieves the dynamic game (or lobby) id.
  const { id: gameId } = useParams();
  // const currentUserId = localStorage.getItem("id");
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const [countdown, setCountdown] = useState<number>(300);
  // const { message } = AntApp.useApp();

  // Fetch game detail information for the countdown.
  useEffect(() => {
    const fetchGameDetail = async () => {
      try {
        const detail = await apiService.get<GameDetail>(`/game/${gameId}`);
        setGameDetail(detail);
      } catch (error) {
        console.error("Failed to fetch game details:", error);
      }
    };
    if (gameId) {
      fetchGameDetail();
    }
  }, [apiService, gameId]);

  // Countdown timer computation using game detail.
  useEffect(() => {
    const countdownSeconds = 10; // Use a fixed 5min countdown
    const startTime = Date.now();
    const endTime = startTime + countdownSeconds * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.floor((endTime - now) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        setCountdown(0);
        router.push(`/lobby/${gameId}/leader_board`);
      } else {
        setCountdown(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameId, router]);
  return (
    <AntApp>
      <div
        style={{
          maxWidth: 550,
          margin: "20px auto",
          padding: 2,
          textAlign: "center",
        }}
      >
        <Logo />
        <br />
        <div>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: "36px" }}>
              Market Closes in {countdown} s
            </Text>
          </div>
        </div>
        <Portfolio player={dummyPlayer} />
        <br />
        <div>
          <Title level={2}>Available Stocks</Title>
        </div>
        <br />
      </div>
    </AntApp>
  );
};

export default GamePage;
