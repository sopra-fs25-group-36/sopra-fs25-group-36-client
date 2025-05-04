"use client";

import Image from "next/image"; // make sure this is imported
import { InputNumber, Button, Typography, message, Spin, Modal } from "antd"; // Import Spin, Modal
import React, {useEffect, useRef, useState} from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { useApi } from "@/hooks/useApi";

import { StockPriceGetDTO } from "@/types/stock";
import StockChart from "@/components/StockChart"; // Import the chart component
import { StockDataPointDTO } from "@/types/chart"; // Import the DTO type for chart data

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
  const currentUserId = localStorage.getItem("id");

  // State for transactions
  const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>(
    {}
  );
  const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>(
    {}
  );

  // State for current round stock list
  const [currentStocks, setCurrentStocks] = useState<StockPriceGetDTO[]>([]);
  const [categories, setCategories] = useState<{
    [category: string]: StockPriceGetDTO[];
  }>({}); // Store categorized API data
  const [isLoading, setIsLoading] = useState(true);

  // State for Chart Modal
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(
    null
  );
  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Polling the page to check if everyone submitted
  const [hasSubmitted, setHasSubmitted] = useState(false);                // ← NEW
  const [waitingForOthers, setWaitingForOthers] = useState(false);        // ← NEW
  const [lastRoundAtSubmit, setLastRoundAtSubmit] = useState<number>(round); // ← NEW
  const pollRef = useRef<NodeJS.Timeout | null>(null);                   // ← NEW

  // Fetch current round stock data
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
        const data = await apiService.get<StockPriceGetDTO[]>(
          `/api/stocks/${gameId}/stocks`
        );
        setCurrentStocks(data); // Keep the flat list if needed elsewhere

        // Categorize the fetched data (using your existing logic)
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
          // Add IBM if it's consistently part of your game stocks
          MISC: ["IBM"], // Example if IBM doesn't fit others
        };

        const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
        // const apiSymbols = new Set(data.map((item) => item.symbol));

        for (const [category, symbolsInCategory] of Object.entries(
          defaultCategories
        )) {
          const stocksInCategory = data.filter((stock) =>
            symbolsInCategory.includes(stock.symbol)
          );
          if (stocksInCategory.length > 0) {
            categorizedData[category] = stocksInCategory.sort((a, b) =>
              a.symbol.localeCompare(b.symbol)
            ); // Sort within category
          }
        }
        // Handle stocks from API not in default categories (optional)
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
        console.log("Categorized stock data:", categorizedData);
      } catch (err) {
        console.error("Failed to fetch stock data", err);
        message.error("Could not load stock data for this round.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [apiService, gameId, round]); // Rerun when gameId changes

  const handleAmountChange = (
    symbol: string,
    value: number | null,
    type: "buy" | "sell"
  ) => {
    const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
    setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
  };

  const getCurrentPrice = (symbol: string): number | undefined => {
    // Find price from the categorized data for efficiency if available
    for (const category in categories) {
      const stock = categories[category].find((s) => s.symbol === symbol);
      if (stock) return stock.price;
    }
    // Fallback to flat list if needed (though should be in categories)
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
    console.log(
      `${type.toUpperCase()}`,
      symbol,
      "amount:",
      amount,
      "price:",
      price
    );
    // Add your actual API call logic here
    message.info(
      `Processing ${type} ${amount} of ${symbol} at $${price.toFixed(2)}...`
    );
  };

  // --- POLLING FUNCTION ---
  const startPollingStatus = (submittedRound: number) => {
    const poll = async () => {
      console.log(`🔄 Polling status (lastRound=${submittedRound})…`);
      try {
        const roundParam = submittedRound ?? 0;
        const { allSubmitted, roundEnded } = await apiService.get<RoundStatusDTO>(
            `/game/${gameId}/status?lastRound=${submittedRound}`
        );
        console.log("Polling with lastRound:", roundParam);
        console.log(`✅ Poll response: allSubmitted=${allSubmitted}, roundEnded=${roundEnded}`);

        if (allSubmitted || roundEnded) {
          console.log("🚀 Condition met, redirecting to transition page");
          router.push(`/lobby/${gameId}/game/transition`);
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch {
        pollRef.current = setTimeout(poll, 5000);
      }
    };
    console.log("Polling with lastRound:", submittedRound);

    void poll();
  };

  // --- CLEAN UP POLL TIMER ---
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  // --- SUBMIT ROUND (wired to polling) ---
  const handleSubmitRound = async () => {
    try {
      const transactions = [];
      // 1) send all your sell tx
      for (const [symbol, qty] of Object.entries(sellAmounts)) {
        await apiService.post(`/api/transaction/${gameId}/submit?userId=${currentUserId}`, {
          stockId: symbol,
          quantity: qty,
          type: "SELL",
        });
        transactions.push({
          stockId: symbol,
          quantity: qty,
          type: "SELL",
        });
      }
      // 2) send all your buy tx
      for (const [symbol, qty] of Object.entries(buyAmounts)) {
        await apiService.post(`/api/transaction/${gameId}/submit?userId=${currentUserId}`, {
          stockId: symbol,
          quantity: qty,
          type: "BUY",
        });
        transactions.push({
          stockId: symbol,
          quantity: qty,
          type: "BUY",
        });
      }console.log(
          `✅ handleSubmitRound: current round = ${round}, passing lastRound = ${round - 1}`
      );

      //seungju's part
      const bulkResponse = await apiService.post(
          `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
          transactions
      );
      console.log("Bulk submission response:", bulkResponse);

      console.log(
          `✅ handleSubmitRound: current round = ${round}, passing lastRound = ${round - 1}`
      );


      // 3) trigger the waiting overlay + polling
      setHasSubmitted(true);
      setWaitingForOthers(true);
      setLastRoundAtSubmit(round);
      startPollingStatus(round-1);

    } catch (err) {
      console.error(err);
      message.error("Failed to submit transactions. Try again.");
    }
  };

  //   // --- Function to show chart ---
  const showChartForStock = async (symbol: string) => {
    setSelectedStockSymbol(symbol);
    setIsChartLoading(true);
    setChartError(null);
    setChartData([]); // Clear previous data

    try {
      // Make API call to your new chart endpoint
      const historyData = await apiService.get<StockDataPointDTO[]>(
        `/api/charts/${symbol}/daily`
      );
      if (historyData && historyData.length > 0) {
        setChartData(historyData);
      } else {
        setChartError(`No historical data found for ${symbol}.`);
      }
    } catch (err: unknown) {
      console.error(`Failed to fetch chart data for ${symbol}`, err);

      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";

      setChartError(`Could not load chart data for ${symbol}. ${errorMessage}`);
      message.error(`Could not load chart data for ${symbol}.`);
    } finally {
      setIsChartLoading(false);
    }
  };

  const handleCloseChartModal = () => {
    setSelectedStockSymbol(null);
    setChartData([]); // Clear data when closing
    setChartError(null);
  };

  // -- Main Render --
  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
        color: "var(--foreground)",
      }}
    >
      {/* Header Area */}
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

      {/* Main Content Area (Flex Container) */}
      {/* Using previous layout structure */}
      <div style={{ display: "flex", gap: "25px", alignItems: "stretch" }}>
        {/* Left Pane: Transaction Area */}
        <div
          style={{
            flex: "1 1 100%", // Take full width if no table
            backgroundColor: "var(--card-background)",
            borderRadius: "16px",
            padding: "24px",
            // border: "1px solid #374151",
            maxHeight: "calc(85vh)", // Adjusted height
            overflowY: "auto",
          }}
        >
          <Typography.Title
            level={4}
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
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    paddingLeft: 0,
                    listStyle: "none",
                  }}
                >
                  <li
                    style={{
                      display: "grid",
                      gridTemplateColumns: "225px 1fr 1fr",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
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
                    </div>
                    {/* Buy Controls */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Buy
                    </div>
                    {/* Sell Controls */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Sell
                    </div>
                  </li>
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
                      {/* Icon */}

                      <Image
                        src={`/icons/${stock.symbol}.png`}
                        alt={`${stock.symbol} icon`}
                        width={24}
                        height={24}
                        style={{ objectFit: "contain" }}
                      />

                      {/* Symbol - CLICKABLE FOR CHART */}
                      <span
                        onClick={() => showChartForStock(stock.symbol)} // <-- Call chart function
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
                      {/* Price */}
                      <span style={{ fontWeight: "500", textAlign: "right" }}>
                        ${stock.price.toFixed(2)}
                      </span>
                      {/* Buy Controls */}
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
                      </div>
                      {/* Sell Controls */}
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
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Removed Right Pane: Stock Info Table */}
        {/* <div style={{ flex: '1 1 40%', alignSelf: 'stretch' }}> ... table ... </div> */}
      </div>

      {/* Submit & Timer (Fixed Position) */}
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
        {/* Timer */}
        <div
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography.Text style={{ fontWeight: "bold", fontSize: "1rem" }}>
            Time left: {timer === null ? "..." : `${timer}s`}
          </Typography.Text>
        </div>
        {/* Submit Button */}
        <Button
          type="primary"
          size="large"
          onClick={handleSubmitRound}
          disabled={hasSubmitted || isLoading}
        >
          Submit Round
        </Button>
      </div>
      {/* Waiting Overlay for early submitters */}
      {hasSubmitted && waitingForOthers && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex", justifyContent: "center", alignItems: "center",
            pointerEvents: "none", zIndex: 999
          }}>
            <div style={{
              pointerEvents: "auto",
              padding: 16,
              background: "white",
              borderRadius: 4
            }}>
              <Typography.Text>
                Transaction Successful. Waiting for the rest of the players to make their transaction…
              </Typography.Text>
            </div>
          </div>
      )}
      <Modal
        title={`Stock Chart: ${selectedStockSymbol || ""}`}
        open={!!selectedStockSymbol} // Show modal when a symbol is selected
        onCancel={handleCloseChartModal}
        footer={null} // No OK/Cancel buttons needed
        width={900} // Adjust width as needed
        style={{ top: 20 }} // Position modal slightly from top
        maskClosable={true} // Allow closing by clicking outside
        destroyOnClose={true} // Unmount chart component when modal closes
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
          // Render the chart component only when data is ready
          <StockChart data={chartData} symbol={selectedStockSymbol} />
        ) : (
          // Fallback case if data is empty but no error (might happen briefly)
          <Typography.Text
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "20px",
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
