"use client";

import React from "react";
import {
  ConfigProvider,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  theme,
} from "antd";

const { Title } = Typography;
const { darkAlgorithm } = theme;

interface StockHolding {
  symbol: string;
  quantity: number;
  category: string;
  currentPrice: number;
}

interface Transaction {
  stockId: string;
  quantity: number;
  price: number;
  type: string;
}

interface PlayerState {
  userId: number;
  cashBalance: number;
  stocks: StockHolding[];
  transactionHistory: Transaction[];
}

const Portfolio: React.FC<{ player: PlayerState }> = ({ player }) => {
  const categoryTotals: Record<string, number> = {};

  player.stocks.forEach((stock) => {
    const value = stock.currentPrice * stock.quantity;
    categoryTotals[stock.category] =
      (categoryTotals[stock.category] || 0) + value;
  });

  const stockValue = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const totalAssets = stockValue + player.cashBalance;

  return (
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
      }}
    >
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Title level={2} style={{ color: "#fff" }}>
            Your Portfolio
          </Title>
        </div>

        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
          <Col xs={22} sm={20} md={8}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Statistic
                title="Cash"
                value={player.cashBalance}
                prefix="$"
                precision={2}
              />
            </Card>
          </Col>

          <Col xs={22} sm={20} md={8}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Statistic
                title="Stock Value"
                value={stockValue}
                prefix="$"
                precision={2}
              />
            </Card>
          </Col>

          <Col xs={22} sm={20} md={8}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Statistic
                title="Total Assets"
                value={totalAssets}
                prefix="$"
                precision={2}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
};

export default Portfolio;
