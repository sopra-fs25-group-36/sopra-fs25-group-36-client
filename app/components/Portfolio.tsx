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
import BarChart from "@/components/BarChart";
import PieChart from "@/components/PieChart";

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
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <Col span={12}>
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <Title level={2}>Your Portfolio</Title>
        </div>

        <Row>
          <Col xs={22} sm={24} md={8} lg={8} xl={810}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Statistic
                title="Available Cash"
                value={player.cashBalance}
                prefix="$"
                precision={2}
              />
            </Card>
          </Col>

          <Col xs={22} sm={24} md={8} lg={8} xl={810}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Statistic
                title="Portfolio Value"
                value={stockValue}
                prefix="$"
                precision={2}
              />
            </Card>
          </Col>

          <Col xs={22} sm={24} md={8} lg={8} xl={810}>
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

        {/* if we are at round 1, no stocks owned*/}
        {player.stocks.length === 0 ? (
          <div
            style={{
              marginTop: 24,
              padding: 20,
              textAlign: "center",
              minHeight: 400,
              backgroundColor: "#fffbe6",
              border: "1px solid #ffe58f",
              borderRadius: 8,
            }}
          >
            <Title level={5} style={{ color: "#faad14" }}>
              You do not currently have any stocks in your portfolio.
            </Title>
            <p style={{ fontSize: 14 }}>
              Buy some stocks on the left and hit <strong>"Submit"</strong> — you'll see your stock holdings here in the next round!
            </p>
          </div>
        ) : (
          <>
            <PieChart data={pieData} colorMap={categoryColorMap} />
            <BarChart data={barData} colorMap={categoryColorMap} />
          </>
        )}
      </Col>
    </ConfigProvider>
  );
};

export default Portfolio;
