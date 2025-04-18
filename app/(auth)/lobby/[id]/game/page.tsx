
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { App as AntApp, Typography, Row, Col } from "antd";
import Logo from "@/components/Logo";
import { useApi } from "@/hooks/useApi";
import Portfolio from "@/components/Portfolio";

const { Title } = Typography;

const dummyPlayer = {
  userId: 42,
  cashBalance: 3200,
  stocks: [
    { symbol: "AAPL", quantity: 10, category: "Tech", currentPrice: 160 },
    { symbol: "XOM", quantity: 8, category: "Energy", currentPrice: 110 },
    { symbol: "JPM", quantity: 5, category: "Finance", currentPrice: 130 },
    { symbol: "PFE", quantity: 12, category: "Healthcare", currentPrice: 45 },
    { symbol: "PG", quantity: 3, category: "Consumer", currentPrice: 150 },
    { symbol: "AMZN", quantity: 10, category: "Tech", currentPrice: 20 },
  ],
  transactionHistory: [
    { stockId: "AAPL", quantity: 5, price: 155, type: "BUY" },
    { stockId: "XOM", quantity: 3, price: 108, type: "BUY" },
    { stockId: "AAPL", quantity: 2, price: 162, type: "SELL" },
  ],
};

interface GameDetail {
  createdAt: string;
  timeLimitSeconds: number;
}

const GamePage: React.FC = () => {
  const apiService = useApi();
  const { id: gameId } = useParams();
  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);

  // Fetch game detail and log the request/response for debugging.
  useEffect(() => {
    const fetchGameDetail = async () => {
      if (!gameId) return;
      console.log(`[GamePage] GET /game/${gameId}`);
      try {
        const detail = await apiService.get<GameDetail>(`/game/${gameId}`);
        console.log("[GamePage] response:", detail);

        setGameDetail(detail);
      } catch (error) {
        console.error("[GamePage] Failed to fetch game details:", error);
      }
    };

    fetchGameDetail();
  }, [apiService, gameId]);

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
          {/* Left container */}
          <Portfolio player={dummyPlayer} />

          {/* Right container */}
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
