"use client";

import Image from "next/image";
import { InputNumber, Button, Typography, message, Spin, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { useApi } from "@/hooks/useApi";

import { StockPriceGetDTO } from "@/types/stock";
import StockChart from "@/components/StockChart";
import { StockDataPointDTO } from "@/types/chart";
import { companyDescriptions } from "@/data/companyDescriptions"; // Added from old version

// Interface for player holdings (simplified from PlayerStateDTO or PlayerHolding)
interface PlayerHoldingItem {
  symbol: string;
  quantity: number;
}

interface TransactionPageProps {
  onToggleLayout: () => void;
}

interface RoundStatusDTO {
  allSubmitted: boolean;
  roundEnded: boolean;
  nextRoundStartTime: number; // From new version
}

interface PlayerStateDTO { // From new version
  cashBalance: number;
  playerStocks: Record<string, number>;
}

interface GameResponseDTO { // From new version
  playerStates: Record<string, PlayerStateDTO>;
}

interface TransactionDTO { // From new version
  stockId: string;
  quantity: number;
  type: "BUY" | "SELL";
}

const TransactionPage: React.FC<TransactionPageProps> = ({
  onToggleLayout,
}) => {
  const router = useRouter();
  const { id } = useParams();
  const gameId = Number(id);
  const apiService = useApi();
  const { round, timer } = useGame(gameId);
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem("id") : null;

  // State for transactions
  const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>({});
  const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>({});

  // State for stock list, categories, and market date
  const [categories, setCategories] = useState<{ [category: string]: StockPriceGetDTO[] }>({});
  const [currentRoundMarketDate, setCurrentRoundMarketDate] = useState<string | null>(null); // Added from old

  // State for player cash and holdings
  const [playerCash, setPlayerCash] = useState<number>(0); // From new
  const [playerHoldings, setPlayerHoldings] = useState<{ [symbol: string]: number }>({}); // Combined

  // Loading states
  const [isPageLoading, setIsPageLoading] = useState(true); // Combined loading state

  // State for Chart Modal
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Polling state
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [, setLastRoundAtSubmit] = useState<number>(round);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!gameId || isNaN(gameId) || !currentUserId) {
        setIsPageLoading(false);
        if (!currentUserId && typeof window !== 'undefined') message.error("User ID not found. Please log in again.");
        else if (isNaN(gameId)) message.error("Invalid Game ID in URL.");
        return;
      }

      setIsPageLoading(true);
      setCategories({});
      setCurrentRoundMarketDate(null);
      setPlayerHoldings({});
      setBuyAmounts({});
      setSellAmounts({});
      setHasSubmitted(false);
      setWaitingForOthers(false);

      try {
        // Fetch stock prices
        const stockPriceData = await apiService.get<StockPriceGetDTO[]>(`/api/stocks/${gameId}/stocks`);
        if (stockPriceData && stockPriceData.length > 0 && stockPriceData[0].date) {
          setCurrentRoundMarketDate(stockPriceData[0].date);
        } else if (stockPriceData && stockPriceData.length > 0) {
          message.warning("Market date for current round not found; chart might show all historical data.");
        }

        const defaultCategories: { [category: string]: string[] } = {
          TECH: ["AAPL", "TSLA", "AMZN", "MSFT", "NVDA", "GOOG", "INTC", "NFLX", "AMD"],
          ENERGY: ["XOM", "CVX"], FINANCE: ["JPM", "GS"], HEALTHCARE: ["PFE", "JNJ"],
          CONSUMER: ["PG"], MISC: ["IBM"],
        };
        const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
        (stockPriceData || []).forEach(stock => {
          let assignedCategory = "OTHER";
          if (stock.category && defaultCategories[stock.category.toUpperCase()]) {
             assignedCategory = stock.category.toUpperCase();
          } else {
            for (const [cat, symbolsInCategory] of Object.entries(defaultCategories)) {
              if (symbolsInCategory.includes(stock.symbol)) {
                assignedCategory = cat;
                break;
              }
            }
          }
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

        // Fetch player state (cash and holdings)
        const gameData = await apiService.get<GameResponseDTO>(`/game/${gameId}`);
        const ps = gameData?.playerStates?.[currentUserId];
        if (ps) {
          setPlayerCash(ps.cashBalance);
          setPlayerHoldings(ps.playerStocks ?? {});
        } else {
          message.error("Could not find your player state for this game.");
          setPlayerHoldings({}); // Ensure it's an empty object on failure
        }
      } catch (err) {
        message.error("Could not load initial game data. Please refresh.");
        console.error("Initial data fetch error:", err);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchInitialData();
  }, [apiService, gameId, round, currentUserId]);


  const handleAmountChange = (symbol: string, value: number | null, type: "buy" | "sell") => {
    const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
    setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
  };

  const startPollingStatus = (submittedRoundForPolling: number) => {
    if (pollRef.current) clearTimeout(pollRef.current);
    const poll = async () => {
      console.log(`🔄 Polling status (gameId=${gameId}, pollingForRoundCompletion=${submittedRoundForPolling})…`);
      try {
        // Using new page's parameter logic for polling: `submittedRoundForPolling` is the round that was just submitted.
        const { allSubmitted, roundEnded, nextRoundStartTime } = await apiService.get<RoundStatusDTO>(
            `/game/${gameId}/status?lastRound=${submittedRoundForPolling}`
        );
        console.log(`✅ Poll response: allSubmitted=${allSubmitted}, roundEnded=${roundEnded}, nextRoundStartTime=${nextRoundStartTime}`);
        if (allSubmitted || roundEnded) {
          if (pollRef.current) clearTimeout(pollRef.current);
          const waitTime = nextRoundStartTime - Date.now();
          if (waitTime > 0 && nextRoundStartTime > 0) { // ensure nextRoundStartTime is valid
            console.log(`🚀 All players submitted or round ended. Waiting ${waitTime}ms for synchronized start before redirecting.`);
            setTimeout(() => {
              router.push(`/lobby/${gameId}/game/transition`);
            }, waitTime);
          } else {
            console.log("🚀 All players submitted or round ended. Redirecting to transition page immediately.");
            router.push(`/lobby/${gameId}/game/transition`);
          }
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch (error){
        console.error("Polling failed:", error);
        pollRef.current = setTimeout(poll, 5000); // Longer timeout on error
      }
    };
    void poll();
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearTimeout(pollRef.current);
      }
    };
  }, []);

  const handleSubmitRound = async () => {
    if (!currentUserId) {
        message.error("User ID not found. Cannot submit transactions.");
        return;
    }
    setIsPageLoading(true); // Use main page loader for submission process

    let latestCash = playerCash;
    let latestHoldings = playerHoldings;

    try {
      const game = await apiService.get<GameResponseDTO>(`/game/${gameId}`);
      const ps = game?.playerStates?.[currentUserId];
      if (!ps) {
        message.error("Could not retrieve your current balance/portfolio before submitting.");
        setIsPageLoading(false);
        return;
      }
      latestCash = ps.cashBalance;
      latestHoldings = ps.playerStocks ?? {};
      setPlayerCash(latestCash);
      setPlayerHoldings(latestHoldings);
    } catch (err) {
      console.error("Failed to refresh player state before submit", err);
      message.error("Network error while checking your balance. Please try again.");
      setIsPageLoading(false);
      return;
    }

    let costOfBuys = 0;
    const priceFor = (sym: string): number | undefined => {
      for (const cat in categories) {
        const p = categories[cat].find(s => s.symbol === sym)?.price;
        if (p !== undefined) return p;
      }
      return undefined;
    };

    for (const [symbol, qty] of Object.entries(buyAmounts)) {
      if (qty > 0) {
        const price = priceFor(symbol);
        if (price === undefined) {
          message.error(`Price data missing for ${symbol}. Cannot validate buy.`);
          setIsPageLoading(false); return;
        }
        costOfBuys += price * qty;
      }
    }

    let proceedsFromSells = 0;
    for (const [symbol, qty] of Object.entries(sellAmounts)) {
      if (qty > 0) {
        const price = priceFor(symbol);
        if (price === undefined) {
          message.error(`Price data missing for ${symbol}. Cannot validate sell.`);
          setIsPageLoading(false); return;
        }
        proceedsFromSells += price * qty;
        const owned = latestHoldings[symbol] || 0;
        if (qty > owned) {
          Modal.error({ title: "Not enough shares", content: `You tried to sell ${qty} × ${symbol}, but you only own ${owned}.` });
          setIsPageLoading(false); return;
        }
      }
    }

    const newCash = latestCash + proceedsFromSells - costOfBuys;
    if (newCash < 0) {
      Modal.error({ title: "Insufficient funds", content: `You are $${Math.abs(newCash).toFixed(2)} short for these purchases.` });
      setIsPageLoading(false); return;
    }

    try {
      const transactionsToSubmit: TransactionDTO[] = [];
      for (const [symbol, qty] of Object.entries(sellAmounts)) {
        if (qty > 0) transactionsToSubmit.push({ stockId: symbol, quantity: qty, type: "SELL" });
      }
      for (const [symbol, qty] of Object.entries(buyAmounts)) {
        if (qty > 0) transactionsToSubmit.push({ stockId: symbol, quantity: qty, type: "BUY" });
      }

      if (transactionsToSubmit.length === 0) {
        message.info("No transactions entered. Submitting empty round.");
        // Still need to "submit" to backend to mark as done for the round
        await apiService.post(`/api/transaction/${gameId}/submit?userId=${currentUserId}`, []);
      } else {
        await apiService.post(`/api/transaction/${gameId}/submit?userId=${currentUserId}`, transactionsToSubmit);
      }
      message.success("Transactions submitted successfully!");

      setHasSubmitted(true);
      setWaitingForOthers(true);
      const submittedForRound = round;
      setLastRoundAtSubmit(submittedForRound);
      startPollingStatus(submittedForRound); // Use current round for polling status

    } catch (err) {
      console.error("Failed to submit transactions:", err);
      message.error("Failed to submit transactions. Please try again.");
      setHasSubmitted(false);
      setWaitingForOthers(false);
    } finally {
        setIsPageLoading(false);
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
          const roundEndDate = new Date(currentRoundMarketDate + "T00:00:00Z"); // Assuming date is YYYY-MM-DD
          relevantHistoryData = fullHistoryData.filter(dp => new Date(dp.date + "T00:00:00Z") <= roundEndDate);
        } catch (e) {
          console.error("Date parsing error for chart filter", e);
          setChartError("Error processing date filter. Showing recent data.");
        }
      }
      if (relevantHistoryData.length === 0 && currentRoundMarketDate) {
        setChartError(`No data for ${symbol} up to ${currentRoundMarketDate}. Showing most recent available.`);
        relevantHistoryData = fullHistoryData; // Fallback to full history if filter yields nothing
      } else if (relevantHistoryData.length === 0) {
         setChartError(`No data found for ${symbol}.`);
         setIsChartLoading(false); return;
      }

      relevantHistoryData.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const finalChartData = relevantHistoryData.slice(-MAX_DATA_POINTS_FOR_CHART);

      if (finalChartData.length > 0) setChartData(finalChartData);
      else setChartError(`Not enough data points for ${symbol} (max ${MAX_DATA_POINTS_FOR_CHART}).`);

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
            maxHeight: "calc(85vh - 40px)",
            overflowY: "auto",
            border: "1px solid var(--border-color, #374151)"
          }}
        >
          <Typography.Title level={4} style={{ color: "var(--foreground-muted)", marginBottom: "20px", borderBottom: "1px solid var(--border-color-muted, #4b5563)", paddingBottom: "10px" }}>
            Available Stocks for Trading (Cash: ${playerCash.toFixed(2)})
          </Typography.Title>

          {isPageLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
              <Spin size="large" tip="Loading market data..." />
            </div>
          ) : Object.keys(categories).length === 0 ? (
            <Typography.Text style={{ display: "block", textAlign: "center", padding: "40px 20px", color: "var(--foreground)" }}>
              No stocks available for trading this round.
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
                      position: "sticky", top: -24,
                      backgroundColor: "var(--card-background)", zIndex: 10
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
                        src={`/icons/${stock.symbol}.png`} alt={`${stock.symbol} icon`}
                        width={28} height={28} style={{ objectFit: "contain" }}
                        onError={(e) => (e.currentTarget.src = "/icons/DEFAULT.png")} // Fallback icon
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
                      <span style={{ fontWeight: "bold", textAlign: "right", color: (playerHoldings[stock.symbol] || 0) > 0 ? "var(--positive-color, #4ade80)" : "var(--foreground)" , fontSize: "1.05em"}}>
                        {playerHoldings[stock.symbol] || 0}
                      </span>
                      <InputNumber
                          min={0} placeholder="Amount"
                          value={buyAmounts[stock.symbol] || undefined}
                          onChange={(value) => handleAmountChange(stock.symbol, value, "buy")}
                          style={{ width: '100%', border: "1px solid var(--input-border-color, #4b5563)", background: "var(--input-background, #2d3748)", color: "var(--foreground)" }}
                          controls={false}
                      />
                      <InputNumber
                          min={0} max={playerHoldings[stock.symbol] || 0} placeholder="Amount"
                          value={sellAmounts[stock.symbol] || undefined}
                          onChange={(value) => handleAmountChange(stock.symbol, value, "sell")}
                          style={{ width: '100%', border: "1px solid var(--input-border-color, #4b5563)", background: "var(--input-background, #2d3748)", color: "var(--foreground)" }}
                          controls={false}
                          disabled={!playerHoldings[stock.symbol] || playerHoldings[stock.symbol] === 0}
                      />
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

      {hasSubmitted && waitingForOthers && ( // Using styled Modal from old version
        <Modal open={true} closable={false} footer={null} centered maskStyle={{ backgroundColor: "rgba(0,0,0,0.75)" }} bodyStyle={{padding: 0}}>
          <div style={{ padding: "40px 30px", textAlign: "center", background: "var(--card-background)", borderRadius:"8px", color: "var(--foreground)" }}>
            <Spin size="large" style={{ marginBottom: "25px" }} tip="Processing submission..."/>
            <Typography.Title level={4} style={{ color: "var(--foreground)", marginBottom: "10px" }}>
              Transactions Submitted
            </Typography.Title>
            <Typography.Text style={{ color: "var(--foreground-muted)" }}>
              Waiting for other players to complete their round. This window will close automatically when the next round begins.
            </Typography.Text>
          </div>
        </Modal>
      )}

      <Modal // Chart Modal with company description and fixed colors
        title={<Typography.Title level={4} style={{margin:0, color: "var(--foreground-on-modal, #212529)"}}>{`Stock Chart: ${selectedStockSymbol || ""}`}</Typography.Title>}
        open={!!selectedStockSymbol} onCancel={handleCloseChartModal} footer={null} width={900} style={{ top: 20 }}
        maskClosable={true} destroyOnClose={true}
        bodyStyle={{ backgroundColor: "var(--modal-background, white)", color: "var(--foreground-on-modal, #212529)", padding:"24px"}}
      >
        {isChartLoading ? ( <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "500px" }}><Spin size="large" tip="Loading chart data..." /></div>
        ) : chartError ? ( <Typography.Text style={{ display: "block", textAlign: "center", padding: "20px", color: "var(--error-color, red)"}}>{chartError}</Typography.Text>
        ) : chartData.length > 0 && selectedStockSymbol ? (
          <div>
            <StockChart data={chartData} symbol={selectedStockSymbol} />
            {selectedCompanyInfo && (
              <div style={{ marginTop: "24px", padding: "16px", borderTop: "1px solid var(--border-color-modal, #dee2e6)", background: "var(--card-background-secondary-modal, #f8f9fa)", borderRadius:"8px" }}>
                <Typography.Title level={5} style={{color: "var(--foreground-on-modal, #212529)", marginBottom:"12px"}}>{selectedCompanyInfo.name} ({selectedStockSymbol})</Typography.Title>
                <Typography.Paragraph style={{color: "var(--foreground-muted-on-modal, #495057)", fontSize:"0.9em", lineHeight:"1.6"}}>
                  <strong>Sector:</strong> {selectedCompanyInfo.sector}   |  
                  <strong>Industry:</strong> {selectedCompanyInfo.industry}   |  
                  <strong>Country:</strong> {selectedCompanyInfo.country}
                </Typography.Paragraph>
                <Typography.Paragraph style={{color: "var(--foreground-muted-on-modal, #495057)", maxHeight: '120px', overflowY: 'auto', fontSize:"0.9em", lineHeight:"1.6"}}>
                  {selectedCompanyInfo.description}
                </Typography.Paragraph>
              </div>
            )}
          </div>
        ) : ( <Typography.Text style={{ display: "block", textAlign: "center", padding: "20px", color: "var(--foreground-muted-on-modal, #6c757d)" }}>No chart data available for {selectedStockSymbol}.</Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default TransactionPage;