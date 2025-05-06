"use client";

import Image from "next/image";
import { InputNumber, Button, Typography, message, Spin, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame"; // Adjust path as needed
import { useApi } from "@/hooks/useApi";   // Adjust path as needed

import { StockPriceGetDTO } from "@/types/stock"; // Adjust path as needed
import StockChart from "@/components/StockChart";    // Adjust path as needed
import { StockDataPointDTO } from "@/types/chart";   // Adjust path as needed
import { PlayerHolding } from "@/types/player";    // Adjust path as needed
import { companyDescriptions } from "../data/companyDescriptions"; // Adjust path as needed

interface TransactionPageProps { // Renamed from TransactionListProps for clarity if this is the main page
  onToggleLayout: () => void;
}
interface RoundStatusDTO {
  allSubmitted: boolean;
  roundEnded: boolean;
}

const TransactionPage: React.FC<TransactionPageProps> = ({
  onToggleLayout,
}) => {
  const router = useRouter();
  const { id } = useParams(); // id is gameId from URL
  const gameId = Number(id);
  const apiService = useApi();
  const { round, timer } = useGame(gameId); // useGame hook
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("id") : null;

  // State for transactions
  const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>({});
  const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>({});

  // State for current round stock list & categories
  const [currentStocks, setCurrentStocks] = useState<StockPriceGetDTO[]>([]); // Unused if categories is primary
  const [categories, setCategories] = useState<{ [category: string]: StockPriceGetDTO[] }>({});
  const [isLoading, setIsLoading] = useState(true); // For stock prices
  const [currentRoundMarketDate, setCurrentRoundMarketDate] = useState<string | null>(null);

  // State for player holdings
  const [playerHoldings, setPlayerHoldings] = useState<{ [symbol: string]: number }>({});
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(true);

  // State for Chart Modal
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Polling state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [, setLastRoundAtSubmit] = useState<number>(round); // Keep track of the round for which submission was made
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!gameId || isNaN(gameId) || !currentUserId) {
        setIsLoading(false); setIsLoadingHoldings(false);
        if (!currentUserId && typeof window !== 'undefined') message.error("User ID not found. Please log in again.");
        else if (isNaN(gameId)) message.error("Invalid Game ID in URL.");
        return;
      }

      setIsLoading(true); setIsLoadingHoldings(true);
      setCurrentStocks([]); setCategories({}); setCurrentRoundMarketDate(null);
      setPlayerHoldings({}); setBuyAmounts({}); setSellAmounts({});
      // Determine if hasSubmitted needs to be reset based on round change
      // If useGame's round updates, it implies a new round, so reset submission.
      setHasSubmitted(false);
      setWaitingForOthers(false); // Also reset waiting overlay

      // Fetch stock prices
      try {
        const stockPriceData = await apiService.get<StockPriceGetDTO[]>(`/api/stocks/${gameId}/stocks`);
        if (stockPriceData && stockPriceData.length > 0 && stockPriceData[0].date) {
          setCurrentRoundMarketDate(stockPriceData[0].date);
          console.log("Current Round Market Date SET TO:", stockPriceData[0].date);
        } else if (stockPriceData && stockPriceData.length > 0) {
          message.warning("Market date for current round not found; chart might show all historical data.");
        } else if (!stockPriceData || stockPriceData.length === 0) {
          console.log("No stock data returned for this round from API.");
        }
        setCurrentStocks(stockPriceData || []);

        const defaultCategories: { [category: string]: string[] } = {
          TECH: ["AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOG", "INTC", "NFLX", "AMD"],
          ENERGY: ["XOM", "CVX"], FINANCE: ["JPM", "GS"], HEALTHCARE: ["PFE", "JNJ"],
          CONSUMER: ["PG"], MISC: ["IBM"], // Add IBM if it's a standalone category
        };
        const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
        (stockPriceData || []).forEach(stock => {
          let assignedCategory = "OTHER"; // Default category
          // Prefer API category if available and maps to our known categories
          if (stock.category && defaultCategories[stock.category.toUpperCase()]) {
             assignedCategory = stock.category.toUpperCase();
          } else { // Fallback to client-side defaultCategories based on symbol
            for (const [cat, symbolsInCategory] of Object.entries(defaultCategories)) {
              if (symbolsInCategory.includes(stock.symbol)) {
                assignedCategory = cat;
                break;
              }
            }
          }
          // Ensure 'OTHER' category exists if needed, or MISC if IBM is the only 'OTHER'
          if (assignedCategory === "OTHER" && stock.symbol === "IBM" && defaultCategories["MISC"]) {
              assignedCategory = "MISC";
          }

          if (!categorizedData[assignedCategory]) { categorizedData[assignedCategory] = []; }
          categorizedData[assignedCategory].push(stock);
        });
        for (const category in categorizedData) {
          categorizedData[category].sort((a, b) => a.symbol.localeCompare(b.symbol));
        }
        setCategories(categorizedData);
      } catch (err) {
        message.error("Could not load stock data for this round.");
        console.error("Stock data fetch error:", err);
      } finally {
        setIsLoading(false);
      }

      // Fetch player holdings
      try {
        const holdingsData = await apiService.get<PlayerHolding[]>(`/api/stocks/player-holdings/${currentUserId}?gameId=${gameId}`);
        const holdingsMap = (holdingsData || []).reduce((acc, holding) => {
          acc[holding.symbol] = holding.quantity;
          return acc;
        }, {} as { [symbol: string]: number });
        setPlayerHoldings(holdingsMap);
        console.log("Player holdings fetched:", holdingsMap);
      } catch (err) {
        message.error("Could not load your current stock holdings.");
        console.error("Player holdings fetch error:", err);
        setPlayerHoldings({});
      } finally {
        setIsLoadingHoldings(false);
      }
    };

    fetchInitialData();
  }, [apiService, gameId, round, currentUserId]); // `round` from useGame triggers refetch

  const handleAmountChange = (symbol: string, value: number | null, type: "buy" | "sell") => {
    const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
    setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
  };

  const startPollingStatus = (submittedRoundForPolling: number) => {
    if (pollRef.current) clearTimeout(pollRef.current);
    const poll = async () => {
      console.log(`🔄 Polling status (gameId=${gameId}, lastRoundPolled=${submittedRoundForPolling})…`);
      try {
        const { allSubmitted, roundEnded } = await apiService.get<RoundStatusDTO>(
            `/game/${gameId}/status?lastRound=${submittedRoundForPolling}`
        );
        console.log(`✅ Poll response: allSubmitted=${allSubmitted}, roundEnded=${roundEnded}`);
        if (allSubmitted || roundEnded) {
          console.log("🚀 All players submitted or round ended, redirecting to transition page.");
          if (pollRef.current) clearTimeout(pollRef.current);
          router.push(`/lobby/${gameId}/game/transition`);
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch (error){
        console.error("Polling failed:", error);
        pollRef.current = setTimeout(poll, 5000);
      }
    };
    void poll();
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearTimeout(pollRef.current);
        console.log("Cleared polling timer on component unmount/re-render.");
      }
    };
  }, []); // Empty dependency array: cleanup runs only on unmount

  const handleSubmitRound = async () => {
    if (!currentUserId) {
        message.error("User ID not found. Cannot submit transactions.");
        return;
    }
    setIsLoading(true); // Indicate submission processing
    try {
      const transactionsToSubmit = [];
      for (const [symbol, qty] of Object.entries(sellAmounts)) {
        if (qty > 0) transactionsToSubmit.push({ stockId: symbol, quantity: qty, type: "SELL" });
      }
      for (const [symbol, qty] of Object.entries(buyAmounts)) {
        if (qty > 0) transactionsToSubmit.push({ stockId: symbol, quantity: qty, type: "BUY" });
      }

      if (transactionsToSubmit.length === 0) {
        message.info("No transactions entered to submit for this round.");
      }

      await apiService.post(`/api/transaction/${gameId}/submit?userId=${currentUserId}`, transactionsToSubmit);
      message.success("Transactions submitted successfully!");

      setHasSubmitted(true);
      setWaitingForOthers(true);
      const submittedForRound = round; // The round for which this submission is
      setLastRoundAtSubmit(submittedForRound); // Store it
      // For polling, if your /status endpoint's `lastRound` means "the round whose status I'm checking for completion",
      // and `submittedForRound` is the round number the user just finished, then `submittedForRound - 1` might be incorrect.
      // It depends on how `GameManager.getCurrentRound()` and the `lastRound` param interact.
      // If `lastRound` in API means "client's last known completed round before this submission", then `submittedForRound -1 ` or `submittedForRound` could be right.
      // Let's assume backend's `/status?lastRound=X` means "has round X+1 started or all submitted for X".
      // If `round` from `useGame` is the current active round number (e.g. 1), and submission is for round 1,
      // you poll with `lastRound=0` or `lastRound=1` depending on backend.
      // If your useGame().round gives 'next round', then `round-1` is current.
      // Let's assume `round` is current active round number. Polling should check status for THIS round.
      // Backend status for lastRound=N likely means "is Round N completed by all OR has Round N+1 begun".
      // So if submitting for current round 'R', you want to poll with lastRound = R-1 (previous round).
      startPollingStatus(round -1);

    } catch (err) {
      console.error("Failed to submit transactions:", err);
      message.error("Failed to submit transactions. Please try again.");
      setHasSubmitted(false);
      setWaitingForOthers(false);
    } finally {
        setIsLoading(false); // Submission processing finished
    }
  };

  const showChartForStock = async (symbol: string) => {
    setSelectedStockSymbol(symbol); setIsChartLoading(true); setChartError(null); setChartData([]);
    const MAX_DATA_POINTS_FOR_CHART = 60;
    try {
      const fullHistoryData = await apiService.get<StockDataPointDTO[]>(`/api/charts/${symbol}/daily`);
      if (!fullHistoryData || fullHistoryData.length === 0) {
        setChartError(`No historical data found for ${symbol}.`); setIsChartLoading(false); return;
      }
      let relevantHistoryData = fullHistoryData;
      if (currentRoundMarketDate) {
        try {
          const roundEndDate = new Date(currentRoundMarketDate + "T00:00:00Z");
          relevantHistoryData = fullHistoryData.filter(dp => new Date(dp.date + "T00:00:00Z") <= roundEndDate);
        } catch (e) { console.error("Date parsing error for chart filter", e); setChartError("Error processing date. Showing recent 60.");}
      } else {
        console.warn(`currentRoundMarketDate is not set for ${symbol}. Chart shows last 60 available points.`);
      }
      if (relevantHistoryData.length === 0) {
        setChartError(`No data for ${symbol} up to ${currentRoundMarketDate || 'latest available date'}.`);
        setIsChartLoading(false); return;
      }
      relevantHistoryData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const finalChartData = relevantHistoryData.slice(-MAX_DATA_POINTS_FOR_CHART);
      if (finalChartData.length > 0) setChartData(finalChartData);
      else setChartError(`Not enough data for last ${MAX_DATA_POINTS_FOR_CHART} days for ${symbol}. Consider showing all available for this period.`);
    } catch (err) {
      console.error(`Chart data error for ${symbol}`, err);
      setChartError(`Could not load chart: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsChartLoading(false);
    }
  };

  const handleCloseChartModal = () => {
    setSelectedStockSymbol(null); setChartData([]); setChartError(null);
  };

  const selectedCompanyInfo = selectedStockSymbol ? companyDescriptions[selectedStockSymbol] : null;
  const isPageLoading = isLoading || isLoadingHoldings;

  const iconColWidth = "30px";
  const symbolColWidth = "80px";
  const priceColWidth = "80px";
  const positionColWidth = "70px";
  const actionColWidth = "1fr";
  const columnGap = "15px";
  const gridTemplateColumnsLayout = `${iconColWidth} ${symbolColWidth} ${priceColWidth} ${positionColWidth} ${actionColWidth} ${actionColWidth}`;

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
            maxHeight: "calc(85vh - 40px)", // Adjusted for padding/margins
            overflowY: "auto",
            border: "1px solid var(--border-color, #374151)"
          }}
        >
          <Typography.Title level={4} style={{ color: "var(--foreground-muted)", marginBottom: "20px", borderBottom: "1px solid var(--border-color-muted, #4b5563)", paddingBottom: "10px" }}>
            Available Stocks for Trading
          </Typography.Title>

          {isPageLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
              <Spin size="large" tip="Loading market data..." />
            </div>
          ) : Object.keys(categories).length === 0 ? (
            <Typography.Text style={{ display: "block", textAlign: "center", padding: "40px 20px", color: "var(--foreground)" }}>
              {!isLoading && !isLoadingHoldings && "⚠️ No stocks available for trading this round, or data is still loading."}
            </Typography.Text>
          ) : (
            Object.entries(categories).map(([cat, stocks]) => (
              <div key={cat} style={{ marginBottom: "24px" }}>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0px", paddingLeft: 0, listStyle: "none" }}>
                  <li style={{
                      display: "grid",
                      gridTemplateColumns: gridTemplateColumnsLayout,
                      alignItems: "center",
                      gap: columnGap,
                      padding: "10px 0",
                      borderBottom: "2px solid var(--border-color-strong, #6b7280)",
                      marginBottom: "10px",
                      position: "sticky", // Make header sticky within scrollable container
                      top: -24, // Adjust based on parent padding
                      backgroundColor: "var(--card-background)", // Match parent background
                      zIndex: 10
                  }}>
                    <Typography.Title level={5} style={{ margin: 0, color: "var(--foreground)", gridColumn: "1 / span 3" }}>
                      {cat}
                    </Typography.Title>
                    <Typography.Text style={{ fontWeight: "bold", color: "var(--foreground-muted)", textAlign: "right" }}>Position</Typography.Text>
                    <Typography.Text style={{ fontWeight: "bold", color: "var(--foreground-muted)", textAlign:'center' }}>Buy Qty</Typography.Text>
                    <Typography.Text style={{ fontWeight: "bold", color: "var(--foreground-muted)", textAlign:'center' }}>Sell Qty</Typography.Text>
                  </li>

                  {stocks.map((stock) => (
                    <li
                      key={stock.symbol}
                      style={{
                        display: "grid",
                        gridTemplateColumns: gridTemplateColumnsLayout,
                        alignItems: "center",
                        gap: columnGap,
                        padding: "12px 0",
                        borderBottom: "1px solid var(--border-color, #374151)",
                      }}
                    >
                      <Image
                        src={`/icons/${stock.symbol}.png`}
                        alt={`${stock.symbol} icon`}
                        width={28} height={28}
                        style={{ objectFit: "contain" }}
                        onError={(e) => (e.currentTarget.src = "/icons/DEFAULT.png")}
                      />
                      <span
                        onClick={() => showChartForStock(stock.symbol)}
                        title={`View chart for ${stock.symbol}`}
                        style={{ fontWeight: "bold", color: "#60a5fa", cursor: "pointer", textDecoration: "underline", fontSize: "1.05em" }}
                      >
                        {stock.symbol}
                      </span>
                      <span style={{ fontWeight: "500", textAlign: "right", color: "var(--foreground)", fontSize: "1.05em" }}>
                        ${stock.price.toFixed(2)}
                      </span>
                      <span style={{ fontWeight: "bold", textAlign: "right", color: playerHoldings[stock.symbol] > 0 ? "var(--positive-color, #4ade80)" : "var(--foreground)" , fontSize: "1.05em"}}>
                        {playerHoldings[stock.symbol] || 0}
                      </span>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <InputNumber
                          min={0}
                          placeholder="Amount"
                          value={buyAmounts[stock.symbol] || undefined}
                          onChange={(value) => handleAmountChange(stock.symbol, value, "buy")}
                          style={{ width: '100%', border: "1px solid var(--input-border-color, #4b5563)", background: "var(--input-background)", color: "var(--foreground)" }}
                          controls={false}
                        />
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <InputNumber
                          min={0}
                          max={playerHoldings[stock.symbol] || 0}
                          placeholder="Amount"
                          value={sellAmounts[stock.symbol] || undefined}
                          onChange={(value) => handleAmountChange(stock.symbol, value, "sell")}
                          style={{ width: '100%', border: "1px solid var(--input-border-color, #4b5563)", background: "var(--input-background)", color: "var(--foreground)" }}
                          controls={false}
                          disabled={!playerHoldings[stock.symbol] || playerHoldings[stock.symbol] === 0}
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
        <div style={{ backgroundColor: "rgba(59, 130, 246, 0.8)", padding: "10px 18px", borderRadius: "8px", backdropFilter: "blur(5px)", boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
          <Typography.Text style={{ fontWeight: "bold", fontSize: "1.1rem", color: "var(--foreground-on-accent, white)" }}>
            Time left: {timer === null ? "..." : `${timer}s`}
          </Typography.Text>
        </div>
        <Button type="primary" size="large" onClick={handleSubmitRound} disabled={hasSubmitted || isPageLoading} style={{minWidth: '150px', fontWeight: 'bold'}}>
          {hasSubmitted ? "Waiting..." : "Submit Round"}
        </Button>
      </div>

      {hasSubmitted && waitingForOthers && (
        <Modal open={true} closable={false} footer={null} centered maskStyle={{ backgroundColor: "rgba(0,0,0,0.75)" }} bodyStyle={{padding: 0}}>
          <div style={{ padding: "40px 30px", textAlign: "center", background: "var(--card-background)", borderRadius:"8px", color: "var(--foreground)" }}>
            <Spin size="large" style={{ marginBottom: "25px" }} tip="Processing..."/>
            <Typography.Title level={4} style={{ color: "var(--foreground)", marginBottom: "10px" }}>
              Transactions Submitted
            </Typography.Title>
            <Typography.Text style={{ color: "var(--foreground-muted)" }}>
              Waiting for other players to complete their round. This window will close automatically.
            </Typography.Text>
          </div>
        </Modal>
      )}

      <Modal
        title={<Typography.Title level={4} style={{margin:0, color: "var(--foreground-on-modal, #333)"}}>{`Stock Chart: ${selectedStockSymbol || ""}`}</Typography.Title>}
        open={!!selectedStockSymbol} onCancel={handleCloseChartModal} footer={null} width={900} style={{ top: 20 }}
        maskClosable={true} destroyOnClose={true}
        bodyStyle={{ backgroundColor: "var(--modal-background, white)", color: "var(--foreground-on-modal, #333)", padding:"24px"}}
      >
        {isChartLoading ? ( <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "500px" }}><Spin size="large" tip="Loading chart data..." /></div>
        ) : chartError ? ( <Typography.Text type="danger" style={{ display: "block", textAlign: "center", padding: "20px", color: "var(--error-color, red)"}}>{chartError}</Typography.Text>
        ) : chartData.length > 0 && selectedStockSymbol ? (
          <div>
            <StockChart data={chartData} symbol={selectedStockSymbol} />
            {selectedCompanyInfo && (
              <div style={{ marginTop: "24px", padding: "16px", borderTop: "1px solid var(--border-color, #eee)", background: "var(--card-background-secondary, #f9f9f9)", borderRadius:"8px" }}>
                <Typography.Title level={5} style={{color: "var(--foreground-on-modal, #333)", marginBottom:"12px"}}>{selectedCompanyInfo.name} ({selectedStockSymbol})</Typography.Title>
                <Typography.Paragraph style={{color: "var(--foreground-muted-on-modal, #555)", fontSize:"0.9em"}}>
                  <strong>Sector:</strong> {selectedCompanyInfo.sector}   |  
                  <strong>Industry:</strong> {selectedCompanyInfo.industry}   |  
                  <strong>Country:</strong> {selectedCompanyInfo.country}
                </Typography.Paragraph>
                <Typography.Paragraph style={{color: "var(--foreground-muted-on-modal, #555)", maxHeight: '120px', overflowY: 'auto', fontSize:"0.9em", lineHeight:"1.6"}}>
                  {selectedCompanyInfo.description}
                </Typography.Paragraph>
              </div>
            )}
          </div>
        ) : ( <Typography.Text style={{ display: "block", textAlign: "center", padding: "20px", color: "var(--foreground-muted-on-modal, #555)" }}>No chart data available for {selectedStockSymbol}.</Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default TransactionPage;