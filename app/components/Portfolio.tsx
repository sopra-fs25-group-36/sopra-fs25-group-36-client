"use client";

import React from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import BarChart from "@/components/BarChart";
import PieChart from "@/components/PieChart";
import { PlayerStateDTO } from "@/types/player";
import HeatmapTable from "@/components/HeatmapTable";

const { Title } = Typography;

interface PortfolioProps {
  player: PlayerStateDTO | null;
  gameId: string;
  playerId: number;
}
const Portfolio: React.FC<PortfolioProps> = ({ player, gameId, playerId }) => {
  if (!player) return null;
  const categoryTotals: Record<string, number> = {};

  player.stocks.forEach((stock) => {
    const value = stock.currentPrice * stock.quantity;
    categoryTotals[stock.category] =
      (categoryTotals[stock.category] || 0) + value;
  });

  const stockValue = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const totalAssets = stockValue + player.cashBalance;

  const categoryColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
  };

  const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
    type: category.trim(),
    value,
  }));

  const barData = player.stocks
    .map((stock) => ({
      name: stock.symbol,
      value: stock.currentPrice * stock.quantity,
      category: stock.category,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Row gutter={[13, 13]}>
      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="Available Cash"
            value={player.cashBalance}
            prefix="$"
            precision={2}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="Portfolio Value"
            value={stockValue}
            prefix="$"
            precision={2}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Card>
          <Statistic
            title="Total Assets"
            value={totalAssets}
            prefix="$"
            precision={2}
          />
        </Card>
      </Col>

      <Col span={24}>
        {player.stocks.length === 0 ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              background: "var(--card-background)",
              borderRadius: 8,
              minHeight: 300,
            }}
          >
            <Title level={5}>
              You do not currently have any stocks in your portfolio.
            </Title>
            <p>
              Buy some stocks on the left and hit <strong>Submit</strong> — you
              will see your holdings here next round!
            </p>
          </div>
        ) : (
          <div
            style={{
              maxHeight: "800px",
              overflowY: "auto",
              padding: "16px 0",
              marginRight: 20,
            }}
          >
            <div
              style={{
                margin: "0 auto 16px",
                width: 200,
                height: 200,
              }}
            >
              <PieChart data={pieData} colorMap={categoryColorMap} />
            </div>

            <div
              style={{
                marginBottom: 16,
                width: "100%",
                height: 300,
              }}
            >
              <BarChart data={barData} colorMap={categoryColorMap} />
            </div>

            <div
              style={{
                width: "100%",
                maxHeight: 300,
                overflowY: "auto",
                marginBottom: 50,
              }}
            >
              <HeatmapTable playerId={playerId} gameId={Number(gameId)} />
            </div>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default Portfolio;
