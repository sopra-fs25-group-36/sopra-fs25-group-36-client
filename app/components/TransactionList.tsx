"use client";

import Image from "next/image";
import {
  InputNumber,
  Button,
  Typography,
  message,
  Spin,
  Modal,
  Tag,
  List,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { useApi } from "@/hooks/useApi";
import { StockPriceGetDTO } from "@/types/stock";
import StockChart from "@/components/StockChart";
import { StockDataPointDTO } from "@/types/chart";
import { companyDescriptions } from "@/data/companyDescriptions";

export interface NewsItemDTO {
  id: number;
  title: string;
  url: string;
  summary: string;
  bannerImage: string | null;
  source: string;
  sourceDomain: string;
  publishedTime: string;
  overallSentimentScore: number | null;
  overallSentimentLabel: string | null;
  tickerSentiments: Array<{
    ticker: string;
    relevanceScore: number | string;
    sentimentScore: number | string;
    sentimentLabel: string;
  }>;
}

interface TransactionPageProps {
  onToggleLayout: () => void;
}

interface RoundStatusDTO {
  allSubmitted: boolean;
  roundEnded: boolean;
  nextRoundStartTime: number;
}

interface PlayerStateDTO {
  cashBalance: number;
  playerStocks: Record<string, number>;
}

interface GameResponseDTO {
  playerStates: Record<string, PlayerStateDTO>;
}

interface TransactionDTO {
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
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("id") : null;

  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const [buyAmounts, setBuyAmounts] = useState<{ [symbol: string]: number }>(
    {}
  );
  const [sellAmounts, setSellAmounts] = useState<{ [symbol: string]: number }>(
    {}
  );
  const [categories, setCategories] = useState<{
    [category: string]: StockPriceGetDTO[];
  }>({});
  const [currentRoundMarketDate, setCurrentRoundMarketDate] = useState<
    string | null
  >(null);
  const [playerCash, setPlayerCash] = useState<number>(0);
  const [playerHoldings, setPlayerHoldings] = useState<{
    [symbol: string]: number;
  }>({});

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string | null>(
    null
  );
  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [chartError, setChartError] = useState<string | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItemDTO[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [, setLastRoundAtSubmit] = useState<number>(round);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!gameId || isNaN(gameId) || !currentUserId) {
        setIsPageLoading(false);
        if (!currentUserId && typeof window !== "undefined")
          message.error("User ID not found. Please log in again.");
        else if (isNaN(gameId)) message.error("Invalid Game ID in URL.");
        return;
      }

      setIsPageLoading(true);
      setIsNewsLoading(true);
      setCategories({});
      setCurrentRoundMarketDate(null);
      setPlayerHoldings({});
      setBuyAmounts({});
      setSellAmounts({});
      setHasSubmitted(false);
      setWaitingForOthers(false);
      setNewsItems([]);

      try {
        const stockPriceData = await apiService.get<StockPriceGetDTO[]>(
          `/api/stocks/${gameId}/stocks`
        );
        if (
          stockPriceData &&
          stockPriceData.length > 0 &&
          stockPriceData[0].date
        ) {
          setCurrentRoundMarketDate(stockPriceData[0].date);
        } else if (stockPriceData && stockPriceData.length > 0) {
          message.warning(
            "Market date for current round not found; chart might show all historical data."
          );
        }

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
            "WDAY",
          ],
          RETAIL: ["WMT", "COST", "BABA"],
          ENERGY: ["XOM", "CVX", "SHEL"],
          FINANCE: ["JPM", "GS", "V", "MA"],
          HEALTHCARE: ["PFE", "JNJ", "LLY", "ABBV"],
          CONSUMER: ["PG", "KO", "BTI", "MCD"],
          MISC: ["IBM"],
        };
        const categorizedData: { [category: string]: StockPriceGetDTO[] } = {};
        (stockPriceData || []).forEach((stock) => {
          let assignedCategory = "OTHER";
          if (
            stock.category &&
            defaultCategories[stock.category.toUpperCase()]
          ) {
            assignedCategory = stock.category.toUpperCase();
          } else {
            for (const [cat, symbolsInCategory] of Object.entries(
              defaultCategories
            )) {
              if (symbolsInCategory.includes(stock.symbol)) {
                assignedCategory = cat;
                break;
              }
            }
          }
          if (
            assignedCategory === "OTHER" &&
            stock.symbol === "IBM" &&
            defaultCategories["MISC"]
          ) {
            assignedCategory = "MISC";
          }
          if (!categorizedData[assignedCategory]) {
            categorizedData[assignedCategory] = [];
          }
          categorizedData[assignedCategory].push(stock);
        });
        for (const category in categorizedData) {
          categorizedData[category].sort((a, b) =>
            a.symbol.localeCompare(b.symbol)
          );
        }
        setCategories(categorizedData);

        const gameData = await apiService.get<GameResponseDTO>(
          `/game/${gameId}`
        );
        const ps = gameData?.playerStates?.[currentUserId];
        if (ps) {
          setPlayerCash(ps.cashBalance);
          setPlayerHoldings(ps.playerStocks ?? {});
        } else {
          message.error("Could not find your player state for this game.");
          setPlayerHoldings({});
        }

        setIsPageLoading(false);
        try {
          const newsData = await apiService.get<NewsItemDTO[]>(
            `/api/news/${gameId}`
          );
          setNewsItems(newsData || []);
        } catch (newsErr) {
          message.error("Could not load news data.");
          console.error("News data fetch error:", newsErr);
          setNewsItems([]);
        }
      } catch (err) {
        message.error("Could not load initial game data. Please refresh.");
        console.error("Initial data fetch error:", err);
      } finally {
        setIsPageLoading(false);
        setIsNewsLoading(false);
      }
    };

    fetchInitialData();
  }, [apiService, gameId, round, currentUserId]);

  const handleAmountChange = (
    symbol: string,
    value: number | null,
    type: "buy" | "sell"
  ) => {
    const setter = type === "buy" ? setBuyAmounts : setSellAmounts;
    setter((prev) => ({ ...prev, [symbol]: value ?? 0 }));
  };

  const startPollingStatus = (submittedRoundForPolling: number) => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }

    const poll = async () => {
      console.log(
        `🔄 Polling status (gameId=${gameId}, pollingForRoundCompletion=${submittedRoundForPolling})…`
      );
      try {
        const { allSubmitted, roundEnded, nextRoundStartTime } =
          await apiService.get<RoundStatusDTO>(
            `/game/${gameId}/status?lastRound=${submittedRoundForPolling}`
          );

        console.log(
          `✅ Poll response: allSubmitted=${allSubmitted}, roundEnded=${roundEnded}, nextRoundStartTime=${nextRoundStartTime}`
        );

        if (allSubmitted || roundEnded) {
          if (pollRef.current) {
            clearTimeout(pollRef.current);
            pollRef.current = null;
          }
          if (submittedRoundForPolling === 10) {
            router.push(`/lobby/${gameId}/endgame`);
            return;
          }
          const waitTime = nextRoundStartTime / 100 - Date.now();
          if (nextRoundStartTime > 0 && waitTime > 0) {
            console.log(
              `🚀 All players submitted or round ended. Waiting ${waitTime}ms for synchronized start before redirecting.`
            );
            pollRef.current = setTimeout(() => {
              router.push(`/lobby/${gameId}/game/transition`);
            }, waitTime);
          } else {
            console.log(
              "🚀 All players submitted or round ended. Redirecting to transition page immediately."
            );
            router.push(`/lobby/${gameId}/game/transition`);
          }
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error("❌ Polling failed:", error);
        pollRef.current = setTimeout(poll, 5000);
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
    setIsPageLoading(true);

    let latestCash = playerCash;
    let latestHoldings = playerHoldings;

    try {
      const game = await apiService.get<GameResponseDTO>(`/game/${gameId}`);
      const ps = game?.playerStates?.[currentUserId];
      if (!ps) {
        message.error(
          "Could not retrieve your current balance/portfolio before submitting."
        );
        setIsPageLoading(false);
        return;
      }
      latestCash = ps.cashBalance;
      latestHoldings = ps.playerStocks ?? {};
      setPlayerCash(latestCash);
      setPlayerHoldings(latestHoldings);
    } catch (err) {
      console.error("Failed to refresh player state before submit", err);
      message.error(
        "Network error while checking your balance. Please try again."
      );
      setIsPageLoading(false);
      return;
    }

    let costOfBuys = 0;
    const priceFor = (sym: string): number | undefined => {
      for (const cat in categories) {
        const p = categories[cat].find((s) => s.symbol === sym)?.price;
        if (p !== undefined) return p;
      }
      return undefined;
    };

    for (const [symbol, qty] of Object.entries(buyAmounts)) {
      if (qty > 0) {
        const price = priceFor(symbol);
        if (price === undefined) {
          message.error(
            `Price data missing for ${symbol}. Cannot validate buy.`
          );
          setIsPageLoading(false);
          return;
        }
        costOfBuys += price * qty;
      }
    }

    let proceedsFromSells = 0;
    for (const [symbol, qty] of Object.entries(sellAmounts)) {
      if (qty > 0) {
        const price = priceFor(symbol);
        if (price === undefined) {
          message.error(
            `Price data missing for ${symbol}. Cannot validate sell.`
          );
          setIsPageLoading(false);
          return;
        }
        proceedsFromSells += price * qty;
        const owned = latestHoldings[symbol] || 0;
        if (qty > owned) {
          Modal.error({
            title: "Not enough shares",
            content: `You tried to sell ${qty} × ${symbol}, but you only own ${owned}.`,
          });
          setIsPageLoading(false);
          return;
        }
      }
    }

    const newCash = latestCash + proceedsFromSells - costOfBuys;
    if (newCash < 0) {
      Modal.confirm({
        title: (
          <span style={{ color: "var(--foreground)" }}>Insufficient funds</span>
        ),
        content: (
          <span style={{ color: "var(--foreground)" }}>
            You are {usdFormatter.format(Math.abs(newCash))} short for these
            purchases.
          </span>
        ),
        okText: "OK",
        cancelButtonProps: { style: { display: "none" } },
      });
      setIsPageLoading(false);
      return;
    }

    try {
      const transactionsToSubmit: TransactionDTO[] = [];
      for (const [symbol, qty] of Object.entries(sellAmounts)) {
        if (qty > 0)
          transactionsToSubmit.push({
            stockId: symbol,
            quantity: qty,
            type: "SELL",
          });
      }
      for (const [symbol, qty] of Object.entries(buyAmounts)) {
        if (qty > 0)
          transactionsToSubmit.push({
            stockId: symbol,
            quantity: qty,
            type: "BUY",
          });
      }

      if (transactionsToSubmit.length === 0) {
        message.info("No transactions entered. Submitting empty round.");
        await apiService.post(
          `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
          []
        );
      } else {
        await apiService.post(
          `/api/transaction/${gameId}/submit?userId=${currentUserId}`,
          transactionsToSubmit
        );
      }
      message.success("Transactions submitted successfully!");

      setHasSubmitted(true);
      setWaitingForOthers(true);
      const submittedForRound = round;
      setLastRoundAtSubmit(submittedForRound);
      startPollingStatus(submittedForRound);
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
    setSelectedStockSymbol(symbol);
    setIsChartLoading(true);
    setChartError(null);
    setChartData([]);
    const MAX_DATA_POINTS_FOR_CHART = 60;
    try {
      const fullHistoryData = await apiService.get<StockDataPointDTO[]>(
        `/api/charts/${symbol}/daily`
      );
      if (!fullHistoryData || fullHistoryData.length === 0) {
        setChartError(`No historical data found for ${symbol}.`);
        setIsChartLoading(false);
        return;
      }
      let relevantHistoryData = fullHistoryData;
      if (currentRoundMarketDate) {
        try {
          const roundEndDate = new Date(currentRoundMarketDate + "T00:00:00Z");
          relevantHistoryData = fullHistoryData.filter(
            (dp) => new Date(dp.date + "T00:00:00Z") <= roundEndDate
          );
        } catch (e) {
          console.error("Date parsing error for chart filter", e);
          setChartError("Error processing date filter. Showing recent data.");
        }
      }
      if (relevantHistoryData.length === 0 && currentRoundMarketDate) {
        setChartError(
          `No data for ${symbol} up to ${currentRoundMarketDate}. Showing most recent available.`
        );
        relevantHistoryData = fullHistoryData;
      } else if (relevantHistoryData.length === 0) {
        setChartError(`No data found for ${symbol}.`);
        setIsChartLoading(false);
        return;
      }

      relevantHistoryData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const finalChartData = relevantHistoryData.slice(
        -MAX_DATA_POINTS_FOR_CHART
      );

      if (finalChartData.length > 0) setChartData(finalChartData);
      else
        setChartError(
          `Not enough data points for ${symbol} (max ${MAX_DATA_POINTS_FOR_CHART}).`
        );
    } catch (err) {
      console.error(`Chart data error for ${symbol}`, err);
      setChartError(
        `Could not load chart: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsChartLoading(false);
    }
  };

  const handleCloseChartModal = () => {
    setSelectedStockSymbol(null);
    setChartData([]);
    setChartError(null);
  };

  const selectedCompanyInfo = selectedStockSymbol
    ? companyDescriptions[selectedStockSymbol]
    : null;

  const iconColWidth = "30px";
  const symbolColWidth = "80px";
  const priceColWidth = "80px";
  const positionColWidth = "70px";
  const actionColWidth = "1fr";
  const columnGap = "15px";
  const gridTemplateColumnsLayout = `${iconColWidth} ${symbolColWidth} ${priceColWidth} ${positionColWidth} ${actionColWidth} ${actionColWidth}`;

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
        <Typography.Title
          level={2}
          style={{ margin: 0, color: "var(--foreground)" }}
        >
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

      <div style={{ display: "flex", gap: "25px", alignItems: "stretch" }}>
        <div
          style={{
            flex: "2 1 65%",
            backgroundColor: "var(--card-background)",
            borderRadius: "16px",
            padding: "24px",
            maxHeight: "calc(85vh - 40px)",
            overflowY: "auto",
          }}
        >
          <Typography.Title
            level={4}
            style={{
              color: "var(--foreground-muted)",
              marginBottom: "20px",
              borderBottom: "1px solid var(--border-color-muted)",
              paddingBottom: "10px",
            }}
          >
            Available Stocks for Trading (Your Cash:{" "}
            {usdFormatter.format(playerCash)})
          </Typography.Title>

          {isPageLoading && !isNewsLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <Spin size="large" tip="Loading market data..." />
            </div>
          ) : Object.keys(categories).length === 0 && !isPageLoading ? (
            <Typography.Text
              style={{
                display: "block",
                textAlign: "center",
                padding: "40px 20px",
                color: "var(--foreground)",
              }}
            >
              ❌ No stocks available for trading this round. 💲
            </Typography.Text>
          ) : (
            Object.entries(categories).map(([cat, stocks]) => (
              <div key={cat} style={{ marginBottom: "24px" }}>
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0px",
                    paddingLeft: 0,
                    listStyle: "none",
                  }}
                >
                  <li
                    style={{
                      display: "grid",
                      gridTemplateColumns: gridTemplateColumnsLayout,
                      alignItems: "center",
                      gap: columnGap,
                      padding: "10px 0",
                      borderBottom: "2px solid var(--border-color-muted)",
                      marginBottom: "10px",
                      position: "sticky",
                      top: -24,
                      backgroundColor: "var(--card-background)",
                      zIndex: 10,
                    }}
                  >
                    <Typography.Title
                      level={5}
                      style={{
                        margin: 0,
                        color: "var(--foreground)",
                        gridColumn: "1 / span 3",
                      }}
                    >
                      {cat}
                    </Typography.Title>
                    <Typography.Text
                      style={{
                        fontWeight: "bold",
                        color: "var(--foreground-muted)",
                        textAlign: "right",
                      }}
                    >
                      Position
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontWeight: "bold",
                        color: "var(--foreground-muted)",
                        textAlign: "center",
                      }}
                    >
                      Buy Qty
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontWeight: "bold",
                        color: "var(--foreground-muted)",
                        textAlign: "center",
                      }}
                    >
                      Sell Qty
                    </Typography.Text>
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
                        borderBottom: "1px solid var(--border-color-muted)",
                      }}
                    >
                      <Image
                        src={`/icons/${stock.symbol}.png`}
                        alt={`${stock.symbol} icon`}
                        width={28}
                        height={28}
                        style={{ objectFit: "contain" }}
                        onError={(e) =>
                          (e.currentTarget.src = "/icons/DEFAULT.png")
                        }
                      />
                      <span
                        onClick={() => showChartForStock(stock.symbol)}
                        title={`View chart for ${stock.symbol}`}
                        style={{
                          fontWeight: "bold",
                          color: "#60a5fa",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: "1.05em",
                        }}
                      >
                        {stock.symbol}
                      </span>
                      <span
                        style={{
                          fontWeight: "500",
                          textAlign: "right",
                          color: "var(--foreground)",
                          fontSize: "1.05em",
                        }}
                      >
                        ${stock.price.toFixed(2)}
                      </span>
                      <span
                        style={{
                          fontWeight: "bold",
                          textAlign: "right",
                          color:
                            (playerHoldings[stock.symbol] || 0) > 0
                              ? "var(--button-text)"
                              : "var(--foreground)",
                          fontSize: "1.05em",
                        }}
                      >
                        {playerHoldings[stock.symbol] || 0}
                      </span>
                      <InputNumber
                        min={0}
                        placeholder="Amount"
                        value={buyAmounts[stock.symbol] || undefined}
                        onChange={(value) =>
                          handleAmountChange(stock.symbol, value, "buy")
                        }
                        style={{
                          width: "100%",
                          border: "1px solid var(--border-color-muted)",
                          background: "var(--foreground)",
                          color: "var(--foreground)",
                        }}
                        controls={false}
                      />
                      <InputNumber
                        min={0}
                        max={playerHoldings[stock.symbol] || 0}
                        placeholder="Amount"
                        value={sellAmounts[stock.symbol] || undefined}
                        onChange={(value) =>
                          handleAmountChange(stock.symbol, value, "sell")
                        }
                        style={{
                          width: "100%",
                          border: "1px solid var(--foreground-muted)",
                          background: "var(--foreground)",
                          color: "var(--foreground)",
                        }}
                        controls={false}
                        disabled={
                          !playerHoldings[stock.symbol] ||
                          playerHoldings[stock.symbol] === 0
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        <div
          style={{
            flex: "1 1 35%",
            backgroundColor: "var(--card-background)",
            borderRadius: "16px",
            padding: "24px",
            maxHeight: "calc(85vh - 40px)",
            overflowY: "auto",
          }}
        >
          <Typography.Title
            level={4}
            style={{
              color: "var(--foreground-muted)",
              marginBottom: "20px",
              borderBottom: "1px solid var(--border-color-muted)",
              paddingBottom: "10px",
              position: "sticky",
              top: -24,
              backgroundColor: "var(--card-background)",
              zIndex: 10,
            }}
          >
            Market News & Sentiment
          </Typography.Title>
          {isNewsLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <Spin tip="Loading news..." />
            </div>
          ) : newsItems.length === 0 ? (
            <Typography.Text
              style={{
                display: "block",
                textAlign: "center",
                padding: "20px",
                color: "var(--foreground)",
              }}
            >
              No relevant news found for this game timeline.
            </Typography.Text>
          ) : (
            <List
              itemLayout="vertical"
              dataSource={newsItems.slice(0, 15)}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid var(--border-color-muted)",
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Typography.Link
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "1.0em", fontWeight: "bold" }}
                      >
                        {item.title}
                      </Typography.Link>
                    }
                    description={
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: "0.8em" }}
                      >
                        {item.source} -{" "}
                        {new Date(item.publishedTime).toLocaleDateString()}{" "}
                        {new Date(item.publishedTime).toLocaleTimeString()}
                      </Typography.Text>
                    }
                  />
                  {item.overallSentimentLabel && (
                    <Tag
                      color={
                        item.overallSentimentLabel
                          .toLowerCase()
                          .includes("bullish")
                          ? "green"
                          : item.overallSentimentLabel
                                .toLowerCase()
                                .includes("bearish")
                            ? "red"
                            : "geekblue"
                      }
                      style={{ marginTop: "8px" }}
                    >
                      {item.overallSentimentLabel}
                      {item.overallSentimentScore !== null
                        ? ` (${item.overallSentimentScore.toFixed(2)})`
                        : ""}
                    </Tag>
                  )}
                </List.Item>
              )}
            />
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
            backgroundColor: "#3b82f6",
            padding: "8px 16px",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
          }}
        >
          <Typography.Text
            style={{
              fontWeight: "bold",
              fontSize: "1rem",
              color: "var(--foreground)",
            }}
          >
            Time left: {timer === null ? "..." : `${timer}s`}
          </Typography.Text>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmitRound}
          disabled={hasSubmitted || isPageLoading}
          style={{ minWidth: "150px", fontWeight: "bold" }}
        >
          {hasSubmitted ? "Waiting..." : "Submit Round"}
        </Button>
      </div>

      {hasSubmitted && waitingForOthers && (
        <Modal open={true} closable={false} footer={null} centered>
          <div
            style={{
              padding: "40px 30px",
              textAlign: "center",
              background: "var(--card-background)",
              borderRadius: "8px",
              color: "var(--foreground)",
            }}
          >
            <Spin
              size="large"
              style={{ marginBottom: "25px" }}
              tip="Processing submission..."
            />
            <Typography.Title
              level={4}
              style={{ color: "var(--foreground)", marginBottom: "10px" }}
            >
              Transactions Submitted
            </Typography.Title>
            <Typography.Text style={{ color: "var(--foreground-muted)" }}>
              Waiting for other players to complete their round. This window
              will close automatically when the next round begins.
            </Typography.Text>
          </div>
        </Modal>
      )}

      <Modal
        title={
          <Typography.Title
            level={4}
            style={{ margin: 0, color: "var(--foreground)" }}
          >{`Stock Chart: ${selectedStockSymbol || ""}`}</Typography.Title>
        }
        open={!!selectedStockSymbol}
        onCancel={handleCloseChartModal}
        footer={null}
        width={900}
        style={{ top: 20 }}
        maskClosable={true}
        destroyOnClose={true}
        bodyStyle={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          padding: "24px",
        }}
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
            style={{
              display: "block",
              textAlign: "center",
              padding: "20px",
              color: "#FF0000",
            }}
          >
            {chartError}
          </Typography.Text>
        ) : chartData.length > 0 && selectedStockSymbol ? (
          <div>
            <StockChart data={chartData} symbol={selectedStockSymbol} />
            {selectedCompanyInfo && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  borderTop: "1px solid var(--button-secondary-border)",
                  background: "var(--card-background)",
                  borderRadius: "8px",
                }}
              >
                <Typography.Title
                  level={5}
                  style={{
                    color: "var(--foreground)",
                    marginBottom: "12px",
                  }}
                >
                  {selectedCompanyInfo.name} ({selectedStockSymbol})
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    color: "var(--foreground-muted)",
                    fontSize: "0.9em",
                    lineHeight: "1.6",
                  }}
                >
                  <strong>Sector:</strong> {selectedCompanyInfo.sector}   |
                  <strong>Industry:</strong> {selectedCompanyInfo.industry} |
                  <strong>Country:</strong> {selectedCompanyInfo.country}
                </Typography.Paragraph>
                <Typography.Paragraph
                  style={{
                    color: "var(--foreground-muted)",
                    maxHeight: "120px",
                    overflowY: "auto",
                    fontSize: "0.9em",
                    lineHeight: "1.6",
                  }}
                >
                  {selectedCompanyInfo.description}
                </Typography.Paragraph>
              </div>
            )}
          </div>
        ) : (
          <Typography.Text
            style={{
              display: "block",
              textAlign: "center",
              padding: "20px",
              color: "var(--foreground)",
            }}
          >
            No chart data available for {selectedStockSymbol}.
          </Typography.Text>
        )}
      </Modal>
    </div>
  );
};

export default TransactionPage;
