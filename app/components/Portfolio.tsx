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

  // Prepare data for Pie and Bar charts
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
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
      }}
    >
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
            {" "}
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
            {" "}
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
        {/* <Row> */}
        <PieChart data={pieData} colorMap={categoryColorMap} />
        <BarChart data={barData} colorMap={categoryColorMap} />
        {/* </Row> */}
      </Col>
    </ConfigProvider>
  );
};

export default Portfolio;
