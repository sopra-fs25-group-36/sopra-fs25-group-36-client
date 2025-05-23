"use client";

import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist";
import { StockDataPointDTO } from "@/types/chart";

interface StockChartProps {
  data: StockDataPointDTO[];
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, symbol }) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chartDiv = chartDivRef.current;

    if (!chartDiv || !data || data.length === 0) {
      if (chartDiv) {
        Plotly.purge(chartDiv);
      }
      return;
    }

    const computedStyles = getComputedStyle(document.documentElement);
    const backgroundColor = computedStyles
      .getPropertyValue("--background")
      .trim();
    const foregroundColor = computedStyles
      .getPropertyValue("--foreground")
      .trim();

    const filteredData = data.filter(
      (d) =>
        d.open != null &&
        d.close != null &&
        d.high != null &&
        d.low != null &&
        d.date != null
    );

    const trace: Partial<Plotly.CandlestickData> = {
      x: filteredData.map((d) => d.date),
      close: filteredData.map((d) => d.close as number),
      high: filteredData.map((d) => d.high as number),
      low: filteredData.map((d) => d.low as number),
      open: filteredData.map((d) => d.open as number),
      increasing: { line: { color: "#4ade80" } },
      decreasing: { line: { color: "#f87171" } },
      type: "candlestick",
      name: symbol,
    };

    const layout: Partial<Plotly.Layout> = {
      title: `${symbol} Daily Chart`,
      dragmode: "zoom",
      margin: { r: 10, t: 45, b: 40, l: 60 },
      showlegend: false,
      xaxis: {
        autorange: true,
        rangeslider: { visible: true },
        title: "Date",
        type: "date",
      },
      yaxis: {
        autorange: true,
        title: "Price",
        type: "linear",
      },
      plot_bgcolor: backgroundColor,
      paper_bgcolor: backgroundColor,
      font: { color: foregroundColor },
    };

    Plotly.purge(chartDiv);
    Plotly.newPlot(chartDiv, [trace], layout);

    return () => {
      if (chartDiv) {
        Plotly.purge(chartDiv);
      }
    };
  }, [data, symbol]);

  return <div ref={chartDivRef} style={{ width: "100%", height: "500px" }} />;
};

export default StockChart;
