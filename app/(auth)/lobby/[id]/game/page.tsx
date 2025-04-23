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
import React from "react";
import { Spin, Typography } from "antd";
import { useParams } from "next/navigation";
import usePlayerState from "@/hooks/usePlayerState";
import Portfolio from "@/components/Portfolio";

const { Title } = Typography;

export default function GamePage() {
  // 1️⃣ Grab the raw param
  const { id } = useParams();
  // 2️⃣ Normalize to a single string
  const gameId =
    typeof id === "string"
      ? id
      : Array.isArray(id) && id.length > 0
        ? id[0]
        : "";

  // 3️⃣ Pass that into your hook
  const { player, isLoading, error } = usePlayerState(gameId);

  if (isLoading) return <Spin tip="Loading portfolio…" size="large" />;
  if (error || !player) return <div>Error loading portfolio</div>;

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <Title level={2}>Your Portfolio</Title>
      </div>
      <Portfolio player={player!} />
    </>
  );
}
