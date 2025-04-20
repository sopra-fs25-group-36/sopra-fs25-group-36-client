"use client";

import { InputNumber, Button, Typography, message, Spin, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useGame } from "@/hooks/useGame";
import { useApi } from "@/hooks/useApi";

import { StockPriceGetDTO } from "@/types/stock";
import StockChart from "@/components/StockChart";
import { StockDataPointDTO } from "@/types/chart";

interface TransactionListProps {
  onToggleLayout: () => void;
}

const TransactionPage: React.FC<TransactionListProps> = ({
  onToggleLayout,
}) => {
  const router = useRouter();
  const { id } = useParams();
  const gameId = Number(id);
  const api = useApi();
  const apiService = useApi();
  const { round, timer } = useGame(gameId);
  const currentUserId = localStorage.getItem("id");

  const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>(
    {}
  );
  const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>(
    {}
  );
  const [currentStocks, setCurrentStocks] = useState<StockPriceGetDTO[]>([]);
  const [categories, setCategories] = useState<{
    [category: string]: StockPriceGetDTO[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(
    null
  );
  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!gameId || isNaN(gameId)) {
        setIsLoading(false);
        message.error("Invalid Game ID.");
        return;
      }
      setIsLoading(true);
      setCurrentStocks([]);
      setCategories({});

      try {
        const data = await api.get<StockPriceGetDTO[]>(
          `/api/stocks/${gameId}/stocks`
        );
        setCurrentStocks(data);

        const defaultCategories: { [category: string]: string[] } = {
          TECH: [
            "AAPL",
            "TSLA",
            "AMZN",
            "MSFT",
            "NVDA",
            "GOOG",
            "INTC",
            "NFLX",
            "AMD",
          ],
          ENERGY: ["XOM", "CVX"],
          FINANCE: ["JPM", "GS"],
          HEALTHCARE: ["PFE", "JNJ"],
          CONSUMER: ["PG"],
          MISC: ["IBM"],
        };

        const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
        for (const [category, symbolsInCategory] of Object.entries(
          defaultCategories
        )) {
          const stocksInCategory = data.filter((stock) =>
            symbolsInCategory.includes(stock.symbol)
          );
          if (stocksInCategory.length > 0) {
            categorizedData[category] = stocksInCategory.sort((a, b) =>
              a.symbol.localeCompare(b.symbol)
            );
          }
        }
        const uncategorized = data.filter(
          (stock) =>
            !Object.values(defaultCategories).flat().includes(stock.symbol)
        );
        if (uncategorized.length > 0) {
          categorizedData["OTHER"] = uncategorized.sort((a, b) =>
            a.symbol.localeCompare(b.symbol)
          );
        }

        setCategories(categorizedData);
      } catch (err) {
        console.error("Failed to fetch stock data", err);
        message.error("Could not load stock data for this round.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [api, gameId, round]);

  const handleAmountChange = (
    symbol: string,
    value: number | null,
    type: "buy" | "sell"
  ) => {
    const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
    setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
  };

  const getCurrentPrice = (symbol: string): number | undefined => {
    for (const category in categories) {
      const stock = categories[category].find((s) => s.symbol === symbol);
      if (stock) return stock.price;
    }
    return currentStocks.find((stock) => stock.symbol === symbol)?.price;
  };

  const handleTransaction = (symbol: string, type: "buy" | "sell") => {
    const amount = type === "buy" ? buyAmounts[symbol] : sellAmounts[symbol];
    const price = getCurrentPrice(symbol);

    if (price === undefined) {
      message.error(
        `Price data missing for ${symbol}. Cannot process transaction.`
      );
      return;
    }
    message.info(
      `Processing ${type} ${amount} of ${symbol} at $${price.toFixed(2)}...`
    );
  };

  const showChartForStock = async (symbol: string) => {
    setSelectedStockSymbol(symbol);
    setIsChartLoading(true);
    setChartError(null);
    setChartData([]);

    try {
      const historyData = await api.get<StockDataPointDTO[]>(
        `/api/charts/${symbol}/daily`
      );
      if (historyData && historyData.length > 0) {
        setChartData(historyData);
      } else {
        setChartError(`No historical data found for ${symbol}.`);
      }
    } catch (err) {
      const error = err as Error;
      console.error(`Failed to fetch chart data for ${symbol}`, error);
      setChartError(
        `Could not load chart data for ${symbol}. ${error.message || ""}`
      );
      message.error(`Could not load chart data for ${symbol}.`);
    }
  };

  const handleCloseChartModal = () => {
    setSelectedStockSymbol(null);
    setChartData([]);
    setChartError(null);
  };

  const handleSubmitRound = async () => {
    for (const [key, value] of Object.entries(sellAmounts)) {
      const response = await apiService.post<string>(
        `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
        {
          stockId: key,
          quantity: value,
          type: "SELL",
        }
      );
      console.log(response);
    }

    for (const [key, value] of Object.entries(buyAmounts)) {
      const response = await apiService.post<string>(
        `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
        {
          stockId: key,
          quantity: value,
          type: "BUY",
        }
      );
      console.log(response);
    }

    setTimeout(() => router.push(`/lobby/${gameId}/leader_board`), 1000);
  };

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        color: "var(--foreground)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          padding: "0 10px",
        }}
      >
        <Typography.Title level={2} style={{ margin: 0 }}>
          Trade Stocks - Round {round ?? "..."}
        </Typography.Title>
        <Button
          type="primary"
          onClick={onToggleLayout}
          style={{ fontWeight: "bold" }}
        >
          My Portfolio
        </Button>
      </div>

      <div style={{ display: "flex", gap: "30px", alignItems: "stretch" }}>
        <div
          style={{
            flex: "1 1 100%",
            backgroundColor: "var(--card-background)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #374151",
            maxHeight: "calc(85vh)",
            overflowY: "auto",
          }}
        >
          <Typography.Title
            level={3}
            style={{
              color: "var(--background)",
              marginBottom: "20px",
              borderBottom: "1px solid #4b5563",
              paddingBottom: "10px",
            }}
          >
            Your Transactions
          </Typography.Title>

          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <Spin size="large" />
            </div>
          ) : Object.keys(categories).length === 0 ? (
            <Typography.Text style={{ color: "#9ca3af" }}>
              No stocks available for trading this round.
            </Typography.Text>
          ) : (
            Object.entries(categories).map(([cat, stocks]) => (
              <div key={cat} style={{ marginBottom: "24px" }}>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "12px",
                    color: "var(--foreground)",
                    borderBottom: "2px solid #4b5563",
                    paddingBottom: "4px",
                    display: "inline-block",
                  }}
                >
                  {cat}
                </h3>
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    paddingLeft: 0,
                    listStyle: "none",
                  }}
                >
                  {stocks.map((stock) => (
                    <li
                      key={stock.symbol}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "30px 80px 80px 1fr 1fr",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <Image
                        src={`/icons/${stock.symbol}.png`}
                        alt={`${stock.symbol} icon`}
                        width={24}
                        height={24}
                        style={{
                          objectFit: "contain",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/icons/default.png";
                        }}
                      />
                      <span
                        onClick={() => showChartForStock(stock.symbol)}
                        title={`View chart for ${stock.symbol}`}
                        style={{
                          fontWeight: "600",
                          color: "#60a5fa",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {stock.symbol}
                      </span>
                      <span style={{ fontWeight: "500", textAlign: "right" }}>
                        ${stock.price.toFixed(2)}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Amount"
                          value={buyAmounts[stock.symbol] || undefined}
                          onChange={(value) =>
                            handleAmountChange(stock.symbol, value, "buy")
                          }
                          style={{
                            flexGrow: 1,
                            border: "none",
                          }}
                          controls={false}
                        />
                        <Button
                          onClick={() => handleTransaction(stock.symbol, "buy")}
                          disabled={
                            !buyAmounts[stock.symbol] ||
                            buyAmounts[stock.symbol] <= 0
                          }
                          size="small"
                        >
                          Buy
                        </Button>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <InputNumber
                          min={0}
                          placeholder="Amount"
                          value={sellAmounts[stock.symbol] || undefined}
                          onChange={(value) =>
                            handleAmountChange(stock.symbol, value, "sell")
                          }
                          style={{
                            flexGrow: 1,
                            border: "none",
                          }}
                          controls={false}
                        />
                        <Button
                          onClick={() =>
                            handleTransaction(stock.symbol, "sell")
                          }
                          disabled={
                            !sellAmounts[stock.symbol] ||
                            sellAmounts[stock.symbol] <= 0
                          }
                          size="small"
                        >
                          Sell
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "30px",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography.Text
            style={{ color: "#93c5fd", fontWeight: "bold", fontSize: "1rem" }}
          >
            Time left: {timer === null ? "..." : `${timer}s`}
          </Typography.Text>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmitRound}
          disabled={isLoading}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 20px",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          Submit Round
        </Button>
      </div>

      <Modal
        title={`Stock Chart: ${selectedStockSymbol || ""}`}
        open={!!selectedStockSymbol}
        onCancel={handleCloseChartModal}
        footer={null}
        width={900}
        style={{ top: 20 }}
        maskClosable={true}
        destroyOnClose={true}
      >
        {isChartLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "500px",
            }}
          >
            <Spin size="large" tip="Loading chart data..." />
          </div>
        ) : chartError ? (
          <Typography.Text
            type="danger"
            style={{ display: "block", textAlign: "center", marginTop: "20px" }}
          >
            {chartError}
          </Typography.Text>
        ) : chartData.length > 0 && selectedStockSymbol ? (
          <StockChart data={chartData} symbol={selectedStockSymbol} />
        ) : (
          <Typography.Text
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "20px",
              color: "#9ca3af",
            }}
          >
            No chart data available.
          </Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default TransactionPage;
