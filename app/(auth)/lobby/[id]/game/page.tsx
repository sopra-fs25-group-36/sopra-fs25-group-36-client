// ------------------ EXAMPLE OF DTO for each player state -----------
// const dummyPlayer = {
//     userId: 42,
//     cashBalance: 3200,
//     stocks: [
//         { symbol: "AAPL", quantity: 10, category: "Tech", currentPrice: 160 },
//         { symbol: "XOM", quantity: 8, category: "Energy", currentPrice: 110 },
//         { symbol: "JPM", quantity: 5, category: "Finance", currentPrice: 130 },
//         { symbol: "PFE", quantity: 12, category: "Healthcare", currentPrice: 45 },
//         { symbol: "PG", quantity: 3, category: "Consumer", currentPrice: 150 },
//         { symbol: "AMZN", quantity: 10, category: "Tech", currentPrice: 20 },
//     ],
//     transactionHistory: [
//         { stockId: "AAPL", quantity: 5, price: 155, type: "BUY" },
//         { stockId: "XOM", quantity: 3, price: 108, type: "BUY" },
//         { stockId: "AAPL", quantity: 2, price: 162, type: "SELL" },
//     ],
// };
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { App as AntApp, Typography, Row, Col, Spin } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import Portfolio from "@/components/Portfolio";

const { Title } = Typography;

// ---------- DTOs returned by backend ----------
interface StockHoldingDTO {
  symbol: string;
  quantity: number;
  category: string;
  currentPrice: number;
}

interface TransactionDTO {
  stockId: string;
  quantity: number;
  price: number;
  type: "BUY" | "SELL";
}

interface PlayerStateDTO {
  userId: number;
  cashBalance: number;
  stocks: StockHoldingDTO[];
  transactionHistory: TransactionDTO[];
}
// ---------------------------------------------

const GamePage: React.FC = () => {
  const apiService = useApi();
  const { id: gameId } = useParams();

  // In a real app you would obtain the current userId from auth context or next-auth session
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("id") ?? "" : "";

  const [player, setPlayer] = useState<PlayerStateDTO | null>(null);

  // Fetch live player state once gameId & userId are known
  useEffect(() => {
    const fetchPlayerState = async () => {
      if (!gameId || !userId) return;
      console.log(
        `[GamePage] GET /game/${gameId}/players/${userId}/state`
      );
      try {
        const data = await apiService.get<PlayerStateDTO>(
          `/game/${gameId}/players/${userId}/state`
        );
        const stockHolding = await apiService.get<StockHoldingDTO[]>(
          `/api/stocks/player-holdings/${userId}?gameId=${gameId}`
        );
        console.log("[GamePage] response:", data, stockHolding);
        setPlayer({
          ...data,
          stocks: stockHolding
        });
      } catch (error) {
        console.error("[GamePage] Failed to fetch player state:", error);
      }
    };

    fetchPlayerState();
  }, [apiService, gameId, userId]);

  return (
    <AntApp>
      <div
        style={{
          maxWidth: 1200,
          margin: "20px auto",
          padding: 2,
          textAlign: "center",
        }}
      >
        <Logo />
      </div>

      <Row justify="center" style={{ marginBottom: 24 }}>
        {/* Left container: Portfolio */}
        {player ? (
          <Portfolio player={player} />
        ) : (
          <Spin tip="Loading portfolio..." size="large" />
        )}

        {/* Right container: trading stub */}
        <Col span={12}>
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <Title level={2}>Available Stocks</Title>
          </div>
          <div
            style={{
              backgroundColor: "#808080",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px dashed #d9d9d9",
            }}
          >
            <span style={{ color: "#999" }}>[Trading Component]</span>
          </div>
        </Col>
      </Row>
    </AntApp>
  );
};

export default GamePage;
