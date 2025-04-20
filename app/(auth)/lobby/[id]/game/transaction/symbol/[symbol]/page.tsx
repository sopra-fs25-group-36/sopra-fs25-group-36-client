"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Typography, Spin, Button, message } from "antd";
import StockChart from "@/components/StockChart"; // Assuming StockChart is in components
import { StockDataPointDTO } from "@/types/chart"; // Assuming types/chart.ts exists

const SymbolDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams(); // Use useParams to get dynamic route segments
  const api = useApi();

  // Extract symbol, handle potential array/undefined, and ensure uppercase
  const rawSymbol = params?.symbol;
  const symbol =
    typeof rawSymbol === "string" ? rawSymbol.toUpperCase() : undefined;

  const [chartData, setChartData] = useState<StockDataPointDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if symbol is valid
    if (!symbol) {
      setError("Invalid stock symbol provided in URL.");
      setIsLoading(false);
      return;
    }

    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      setChartData([]); // Clear previous data

      try {
        const historyData = await api.get<StockDataPointDTO[]>(
          `/api/charts/${symbol}/daily`
        );

        if (historyData && historyData.length > 0) {
          // Ensure data has the required fields for candlestick
          const hasRequiredData = historyData.every(
            (d) =>
              d.date != null &&
              d.open != null &&
              d.high != null &&
              d.low != null &&
              d.close != null
          );
          if (hasRequiredData) {
            setChartData(historyData);
          } else {
            console.warn(
              `Data for ${symbol} is missing required fields (open, high, low, close) for some points.`
            );
            setError(`Chart data for ${symbol} is incomplete.`);
          }
        } else {
          setError(
            `No historical data found for ${symbol}. Data might not be fetched yet.`
          );
          message.info(
            `No historical data found for ${symbol}. Try fetching data via the admin endpoint if available.`
          );
        }
      } catch (err: unknown) {
        console.error(`Failed to fetch chart data for ${symbol}`, err);
        let errorMessage = "Please try again later.";

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(`Could not load chart data for ${symbol}. ${errorMessage}`);
        message.error(`Could not load chart data for ${symbol}.`);
      }
    };

    fetchChartData();
  }, [api, symbol]); // Re-fetch if the symbol changes

  // Find gameId to navigate back correctly - needed from parent route usually
  // For simplicity here, we just use router.back()
  // const { id: gameId } = useParams(); // This might not work depending on nested layout params

  return (
    <div
      style={{
        //backgroundColor: "#111827", // Darker main background
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
          marginBottom: "20px",
        }}
      >
        <Typography.Title level={2} style={{ color: "#fff", margin: 0 }}>
          Stock Chart: {symbol || "Loading..."}
        </Typography.Title>
        <Button onClick={() => router.back()} type="default">
          Back to Transactions
        </Button>
      </div>

      <div
        style={{
          //   backgroundColor: "#1f2937", // Inner content background
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #374151",
          minHeight: "600px", // Ensure container has height
          display: "flex",
          flexDirection: "column", // Align items vertically
          alignItems: "center", // Center horizontally
          justifyContent: "center", // Center vertically if no chart
        }}
      >
        {isLoading ? (
          <Spin size="large" tip="Loading chart data..." />
        ) : error ? (
          <Typography.Text type="danger" style={{ fontSize: "1.1rem" }}>
            {error}
          </Typography.Text>
        ) : chartData.length > 0 && symbol ? (
          // Render the chart component full width inside the container
          <div style={{ width: "100%", height: "100%" }}>
            <StockChart data={chartData} symbol={symbol} />
          </div>
        ) : (
          // Fallback if no data and no specific error (should ideally be caught by error state)
          <Typography.Text style={{ color: "#9ca3af" }}>
            No chart data available to display for {symbol}.
          </Typography.Text>
        )}
      </div>
    </div>
  );
};

export default SymbolDetailPage;
