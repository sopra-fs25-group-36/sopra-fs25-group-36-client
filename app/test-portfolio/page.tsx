"use client";

import React from "react";
import PortfolioPage from "@/components/PortfolioPage";

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

export default function StaticPortfolioTest() {
    return <PortfolioPage player={dummyPlayer} />;
}
