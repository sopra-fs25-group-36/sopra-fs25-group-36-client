"use client";

import Image from "next/image";
import { InputNumber, Button, Typography, message, Spin, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame"; // Assuming path
import { useApi } from "@/hooks/useApi";   // Assuming path

import { StockPriceGetDTO } from "@/types/stock"; // Assuming path
import StockChart from "@/components/StockChart";    // Assuming path
import { StockDataPointDTO } from "@/types/chart";   // Assuming path
import { companyDescriptions } from "../data/companyDescriptions"; // Adjust path as needed

interface TransactionListProps {
  onToggleLayout: () => void;
}
interface RoundStatusDTO {
  allSubmitted: boolean;
  roundEnded: boolean;
}

const TransactionPage: React.FC<TransactionListProps> = ({
  onToggleLayout,
}) => {
  const router = useRouter();
  const { id } = useParams();
  const gameId = Number(id);
  const apiService = useApi();
  const { round, timer } = useGame(gameId);
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("id") : null;


  const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>({});
  const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>({});

  const [currentStocks, setCurrentStocks] = useState<StockPriceGetDTO[]>([]); // Keep flat list if needed
  const [categories, setCategories] = useState<{ [category: string]: StockPriceGetDTO[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoundMarketDate, setCurrentRoundMarketDate] = useState<string | null>(null); // For chart filtering

  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [, setLastRoundAtSubmit] = useState<number>(round); // Unused state setter, can be `_`
  const pollRef = useRef<NodeJS.Timeout | null>(null);

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
      setCurrentRoundMarketDate(null);

      try {
        // Assuming API returns StockPriceGetDTO[] where each item has a .date
        const data = await apiService.get<StockPriceGetDTO[]>(
          `/api/stocks/${gameId}/stocks`
        );

        if (data && data.length > 0 && data[0].date) {
          setCurrentRoundMarketDate(data[0].date);
          console.log("Current Round Market Date SET TO:", data[0].date);
        } else if (data && data.length > 0) {
          console.warn("Stock data received, but the first stock item is missing a 'date' field. Chart filtering by date might be affected.");
          message.warning("Market date for current round not found; chart might show all historical data.");
        } else if (!data || data.length === 0) {
          console.log("No stock data returned for this round.");
        }

        setCurrentStocks(data);

        // Categorize data
        const defaultCategories: { [category: string]: string[] } = {
          TECH: ["AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOG", "INTC", "NFLX", "AMD"],
          ENERGY: ["XOM", "CVX"],
          FINANCE: ["JPM", "GS"],
          HEALTHCARE: ["PFE", "JNJ"],
          CONSUMER: ["PG"],
          MISC: ["IBM"],
        };

        const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
        
        // Prefer API category if available and reliable, otherwise use defaultCategories
        data.forEach(stock => {
          let assignedCategory = "OTHER"; // Default
          // Attempt to use API provided category
          if (stock.category && Object.keys(defaultCategories).includes(stock.category.toUpperCase())) {
            assignedCategory = stock.category.toUpperCase();
          } else { // Fallback to client-side defaultCategories
            for (const [cat, symbolsInCategory] of Object.entries(defaultCategories)) {
              if (symbolsInCategory.includes(stock.symbol)) {
                assignedCategory = cat;
                break;
              }
            }
          }
          
          if (!categorizedData[assignedCategory]) {
            categorizedData[assignedCategory] = [];
          }
          categorizedData[assignedCategory].push(stock);
        });

        // Sort stocks within each category
        for (const category in categorizedData) {
            categorizedData[category].sort((a, b) => a.symbol.localeCompare(b.symbol));
        }

        setCategories(categorizedData);
        console.log("Categorized stock data:", categorizedData);

      } catch (err) {
        console.error("Failed to fetch stock data", err);
        message.error("Could not load stock data for this round.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [apiService, gameId, round]);

  const handleAmountChange = (
    symbol: string,
    value: number | null,
    type: "buy" | "sell"
  ) => {
    const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
    setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
  };

  const startPollingStatus = (submittedRound: number) => {
    const poll = async () => {
      console.log(`🔄 Polling status (lastRound=${submittedRound})…`);
      try {
        const { allSubmitted, roundEnded } =
          await apiService.get<RoundStatusDTO>(
            `/game/${gameId}/status?lastRound=${submittedRound}`
          );
        console.log(`✅ Poll response: allSubmitted=${allSubmitted}, roundEnded=${roundEnded}`);

        if (allSubmitted || roundEnded) {
          console.log("🚀 Condition met, redirecting to transition page");
          router.push(`/lobby/${gameId}/game/transition`);
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch (error){
        console.error("Polling failed:", error);
        pollRef.current = setTimeout(poll, 5000); // Retry after longer delay
      }
    };
    void poll();
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const handleSubmitRound = async () => {
    if (!currentUserId) {
        message.error("User ID not found. Cannot submit transactions.");
        return;
    }
    try {
      const transactions = [];
      for (const [symbol, qty] of Object.entries(sellAmounts)) {
        if (qty > 0) transactions.push({ stockId: symbol, quantity: qty, type: "SELL" });
      }
      for (const [symbol, qty] of Object.entries(buyAmounts)) {
        if (qty > 0) transactions.push({ stockId: symbol, quantity: qty, type: "BUY" });
      }

      if (transactions.length === 0) {
        message.info("No transactions to submit.");
        // Decide if you still want to mark as submitted and poll
        // For now, let's assume submitting an empty round is valid for polling
      }

      await apiService.post(
        `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
        transactions
      );
      message.success("Transactions submitted successfully!");

      setHasSubmitted(true);
      setWaitingForOthers(true);
      setLastRoundAtSubmit(round); // Update for polling logic
      startPollingStatus(round -1); // Poll with the round that was just completed from user's perspective

    } catch (err) {
      console.error("Failed to submit transactions:", err);
      message.error("Failed to submit transactions. Please try again.");
    }
  };

  const showChartForStock = async (symbol: string) => {
    setSelectedStockSymbol(symbol);
    setIsChartLoading(true);
    setChartError(null);
    setChartData([]);

    if (!currentRoundMarketDate) {
      console.warn(`Cannot filter chart data: Current round's market date is unknown for ${symbol}.`);
      // Proceed to show full history, or show an error/warning in chart
      // For now, let's allow showing full history if date is missing, but log it.
    }

    try {
      const historyData = await apiService.get<StockDataPointDTO[]>(
        `/api/charts/${symbol}/daily`
      );

      if (historyData && historyData.length > 0) {
        let Gg = historyData
        if (currentRoundMarketDate) {
          try {
            const roundEndDate = new Date(currentRoundMarketDate + "T00:00:00Z"); // Ensure parsing as UTC date

            const filteredData = historyData.filter(dataPoint => {
              const pointDate = new Date(dataPoint.date + "T00:00:00Z"); // Ensure parsing as UTC date
              return pointDate <= roundEndDate;
            });

            if (filteredData.length > 0) {
              setChartData(filteredData);
            } else {
              setChartError(`No historical data found for ${symbol} up to ${currentRoundMarketDate}. Showing all available data.`);
              setChartData(historyData); // Show all if filter results in empty
            }
          } catch (dateParseError) {
            console.error("Error parsing dates for chart filtering:", dateParseError);
            setChartError("Error processing date for chart. Showing all available data.");
            setChartData(historyData); // Fallback to full data on parsing error
          }
        } else {
          setChartData(historyData); // No date to filter by, show all
        }
      } else {
        setChartError(`No historical data found for ${symbol}.`);
      }
    } catch (err: unknown) {
      console.error(`Failed to fetch chart data for ${symbol}`, err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setChartError(`Could not load chart data: ${errorMessage}`);
    } finally {
      setIsChartLoading(false);
    }
  };

  const handleCloseChartModal = () => {
    setSelectedStockSymbol(null);
    setChartData([]);
    setChartError(null);
  };

  const selectedCompanyInfo = selectedStockSymbol ? companyDescriptions[selectedStockSymbol] : null;

  return (
    <div style={{ padding: "30px", minHeight: "100vh", color: "var(--foreground)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", padding: "0 10px" }}>
        <Typography.Title level={2} style={{ margin: 0, color: "var(--foreground)" }}>
          Trade Stocks - Round {round ?? "..."}
        </Typography.Title>
        <Button type="primary" onClick={onToggleLayout} style={{ fontWeight: "bold" }}>
          My Portfolio
        </Button>
      </div>

      <div style={{ display: "flex", gap: "25px", alignItems: "stretch" }}>
        <div
          style={{
            flex: "1 1 100%",
            backgroundColor: "var(--card-background)",
            borderRadius: "16px",
            padding: "24px",
            maxHeight: "calc(85vh)",
            overflowY: "auto",
          }}
        >
          <Typography.Title level={4} style={{ color: "var(--foreground-muted)", marginBottom: "20px", borderBottom: "1px solid #4b5563", paddingBottom: "10px" }}>
            Your Transactions
          </Typography.Title>

          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
              <Spin size="large" />
            </div>
          ) : Object.keys(categories).length === 0 ? (
            <Typography.Text style={{ color: "var(--foreground)" }}>
              ❌ No stocks available for trading this round. 💲
            </Typography.Text>
          ) : (
            Object.entries(categories).map(([cat, stocks]) => (
              <div key={cat} style={{ marginBottom: "24px" }}>
                <ul style={{ display: "flex", flexDirection: "column", gap: "15px", paddingLeft: 0, listStyle: "none" }}>
                  <li style={{ display: "grid", gridTemplateColumns: "225px 1fr 1fr", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "var(--foreground)", borderBottom: "2px solid #4b5563", paddingBottom: "4px", display: "inline-block" }}>
                        {cat}
                      </h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: "var(--foreground-muted)" }}>Buy</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", color: "var(--foreground-muted)" }}>Sell</div>
                  </li>
                  {stocks.map((stock) => (
                    <li
                      key={stock.symbol}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "30px 80px 80px 1fr 1fr",
                        alignItems: "center",
                        gap: "15px",
                        padding: "8px 0",
                        borderBottom: "1px solid var(--border-color, #374151)",
                      }}
                    >
                      <Image
                        src={`/icons/${stock.symbol}.png`}
                        alt={`${stock.symbol} icon`}
                        width={24}
                        height={24}
                        style={{ objectFit: "contain" }}
                        onError={(e) => (e.currentTarget.src = "/icons/DEFAULT.png")} // Fallback icon
                      />
                      <span
                        onClick={() => showChartForStock(stock.symbol)}
                        title={`View chart for ${stock.symbol}`}
                        style={{ fontWeight: "600", color: "#60a5fa", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {stock.symbol}
                      </span>
                      <span style={{ fontWeight: "500", textAlign: "right", color: "var(--foreground)" }}>
                        ${stock.price.toFixed(2)}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <InputNumber
                          min={0}
                          placeholder="Qty"
                          value={buyAmounts[stock.symbol] || undefined}
                          onChange={(value) => handleAmountChange(stock.symbol, value, "buy")}
                          style={{ flexGrow: 1, border: "1px solid #4b5563", background: "var(--input-background)", color: "var(--foreground)" }}
                          controls={false}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <InputNumber
                          min={0}
                          placeholder="Qty"
                          value={sellAmounts[stock.symbol] || undefined}
                          onChange={(value) => handleAmountChange(stock.symbol, value, "sell")}
                          style={{ flexGrow: 1, border: "1px solid #4b5563", background: "var(--input-background)", color: "var(--foreground)" }}
                          controls={false}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: "20px", right: "30px", zIndex: 1000, display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ backgroundColor: "rgba(59, 130, 246, 0.2)", padding: "8px 16px", borderRadius: "8px", backdropFilter: "blur(4px)" }}>
          <Typography.Text style={{ fontWeight: "bold", fontSize: "1rem", color: "var(--foreground)" }}>
            Time left: {timer === null ? "..." : `${timer}s`}
          </Typography.Text>
        </div>
        <Button type="primary" size="large" onClick={handleSubmitRound} disabled={hasSubmitted || isLoading}>
          Submit Round
        </Button>
      </div>

      {hasSubmitted && waitingForOthers && (
        <Modal
          open={true}
          closable={false}
          footer={null}
          centered
          maskStyle={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div style={{ padding: "30px", textAlign: "center", color: "var(--foreground-on-modal, #333)" }}>
            <Spin size="large" style={{ marginBottom: "20px" }}/>
            <Typography.Title level={4} style={{ color: "var(--foreground-on-modal, #333)", marginBottom: "10px" }}>
              Transactions Submitted
            </Typography.Title>
            <Typography.Text style={{ color: "var(--foreground-muted-on-modal, #555)" }}>
              Waiting for other players to complete their round...
            </Typography.Text>
          </div>
        </Modal>
      )}

      <Modal
        title={<Typography.Title level={4} style={{margin:0, color: "var(--foreground-on-modal, #333)"}}>{`Stock Chart: ${selectedStockSymbol || ""}`}</Typography.Title>}
        open={!!selectedStockSymbol}
        onCancel={handleCloseChartModal}
        footer={null}
        width={900}
        style={{ top: 20 }}
        maskClosable={true}
        destroyOnClose={true} // Important to reset chart state
        bodyStyle={{ backgroundColor: "var(--modal-background, white)", color: "var(--foreground-on-modal, #333)"}}
      >
        {isChartLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "500px" }}>
            <Spin size="large" tip="Loading chart data..." />
          </div>
        ) : chartError ? (
          <Typography.Text type="danger" style={{ display: "block", textAlign: "center", marginTop: "20px", color: "var(--error-color, red)"}}>
            {chartError}
          </Typography.Text>
        ) : chartData.length > 0 && selectedStockSymbol ? (
          <div>
            <StockChart data={chartData} symbol={selectedStockSymbol} />
            {selectedCompanyInfo && (
              <div style={{ marginTop: "24px", padding: "16px", borderTop: "1px solid var(--border-color, #eee)" }}>
                <Typography.Title level={5} style={{color: "var(--foreground-on-modal, #333)"}}>{selectedCompanyInfo.name}</Typography.Title>
                <Typography.Paragraph style={{color: "var(--foreground-muted-on-modal, #555)"}}>
                  <strong>Sector:</strong> {selectedCompanyInfo.sector} <br />
                  <strong>Industry:</strong> {selectedCompanyInfo.industry} <br />
                  <strong>Country:</strong> {selectedCompanyInfo.country}
                </Typography.Paragraph>
                <Typography.Paragraph style={{color: "var(--foreground-muted-on-modal, #555)", maxHeight: '150px', overflowY: 'auto'}}>
                  {selectedCompanyInfo.description}
                </Typography.Paragraph>
              </div>
            )}
          </div>
        ) : (
          <Typography.Text style={{ display: "block", textAlign: "center", marginTop: "20px", color: "var(--foreground-muted-on-modal, #555)" }}>
            No chart data available for {selectedStockSymbol}.
          </Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default TransactionPage;