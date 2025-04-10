"use client";

import React from "react";
import { Row, Col, Card, Statistic, Typography } from "antd";
import { Pie } from "@ant-design/charts";
import PieChartComponent from "@/components/PieChartComponent";
import { Bar } from "@ant-design/charts";
import { Chart } from "@ant-design/plots";
import HorizontalBarChart from "@/components/BarChartComponent";



const { Title } = Typography;

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
const categoryColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
};

const PortfolioPage: React.FC<{ player: PlayerState }> = ({ player }) => {
    const categoryTotals: Record<string, number> = {};

    player.stocks.forEach((stock) => {
        const value = stock.currentPrice * stock.quantity;
        categoryTotals[stock.category] =
            (categoryTotals[stock.category] || 0) + value;
    });

    const stockValue = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const totalAssets = stockValue + player.cashBalance;

    const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
        type: category.trim(), // ← trim whitespace!
        value,
    }));
    console.log("Pie data:", pieData);


    const pieConfig = {
        data: pieData,
        angleField: "value",
        colorField: "type",
        radius: 1,
        innerRadius: 0.6,
        autoFit: true,
        label: {
            type: "outer",
            content: (datum: any) => `${datum.type}: $${datum.value.toLocaleString()}`,
            style: {
                fontSize: 12,
                fill: "#000", // force visible label color
            },
        },
        tooltip: {
            showTitle: false,
            formatter: (datum: any) => ({
                name: datum.type,
                value: `$${datum.value.toLocaleString()}`,
            }),
        },
        interactions: [{ type: "element-active" }],
    };

    // Bar chart data (stock-level holdings)
    const barData = player.stocks
        .map((stock) => ({
            name: stock.symbol,
            value: stock.currentPrice * stock.quantity,
            category: stock.category,
        }))
        .sort((a, b) => b.value - a.value); // descending order

    const barConfig = {
        data: barData,
        xField: "value",   // asset value
        yField: "name",    // stock symbol
        seriesField: "category",
        color: (datum: any) => categoryColorMap[datum.category] || "#999",
        layout: "horizontal", // 🔥 force horizontal layout
        barStyle: {
            radius: [0, 4, 4, 0],
        },
        tooltip: {
            formatter: (datum: any) => ({
                name: datum.name,
                value: `$${datum.value.toFixed(2)}`,
            }),
        },
        label: {
            position: "right",
            style: {
                fill: "#000",
            },
            formatter: (datum: any) => `$${datum.value.toLocaleString()}`,
        },
    };


    return (

        <Row gutter={16} style={{ minHeight: "100vh", padding: 24 }}>
            {/* Left container */}
            <Col span={12}>
                <div
                    style={{
                        backgroundColor: "#f0f2f5",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px dashed #d9d9d9",
                    }}
                >
                    <span style={{ color: "#999" }}>[Left container — use later]</span>
                </div>
            </Col>

            {/* Right container */}
            <Col span={12}>
                <Title level={2}>Your Portfolio</Title>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Cash"
                                value={player.cashBalance}
                                prefix="$"
                                precision={2}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Stock Value"
                                value={stockValue}
                                prefix="$"
                                precision={2}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <Statistic
                                title="Total Assets"
                                value={totalAssets}
                                prefix="$"
                                precision={2}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card title="Portfolio Breakdown by Category">
                    <div style={{ height: 300 }}>
                        <PieChartComponent config={pieConfig} />
                    </div>
                </Card>
                <Card title="Holdings by Stock" style={{ marginTop: 24 }}>
                    <div style={{ height: 400 }}>
                        <HorizontalBarChart data={barData} />
                        {/*// colorMap={categoryColorMap}*/}
                    </div>
                </Card>



            </Col>
        </Row>
    );
};

export default PortfolioPage;
