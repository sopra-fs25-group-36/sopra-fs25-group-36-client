"use client"; // Important if using Plotly directly in a client component

import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist"; // Use the distribution bundle
import { StockDataPointDTO } from "@/types/chart"; // Assuming you create this type based on the DTO

interface StockChartProps {
  data: StockDataPointDTO[];
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, symbol }) => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartDivRef.current || !data || data.length === 0) {
      // If no div ref or no data, do nothing or clear previous chart
      if (chartDivRef.current) {
        Plotly.purge(chartDivRef.current); // Clear previous plot if data becomes empty
      }
      return;
    }

    // Prepare data for Plotly Candlestick chart
    const trace = {
      x: data.map((d) => d.date), // Assumes date is a string like 'YYYY-MM-DD'
      close: data.map((d) => d.close),
      high: data.map((d) => d.high),
      low: data.map((d) => d.low),
      open: data.map((d) => d.open),

      // Candlestick colors
      increasing: { line: { color: "#4ade80" } }, // Green
      decreasing: { line: { color: "#f87171" } }, // Red

      type: "candlestick",
      xaxis: "x",
      yaxis: "y",
      name: symbol, // Legend name
    } as Partial<Plotly.CandlestickData> as Plotly.CandlestickData; // Explicit casting

    const layout: Partial<Plotly.Layout> = {
      title: `${symbol} Daily Chart`,
      dragmode: "zoom",
      margin: { r: 10, t: 45, b: 40, l: 60 },
      showlegend: false, // Candlestick name usually not needed as legend
      xaxis: {
        autorange: true,
        // domain: [0, 1], // Usually defaults are fine
        // range: [/* calculate range or leave autorange */],
        rangeslider: {
          // Add range slider at the bottom
          visible: true,
          // range: [/* Optional initial range for slider */]
        },
        title: "Date",
        type: "date",
      },
      yaxis: {
        autorange: true,
        // domain: [0, 1],
        // range: [/* calculate range or leave autorange */],
        title: "Price",
        type: "linear",
      },
      plot_bgcolor: "#1f2937", // Match background
      paper_bgcolor: "#1f2937", // Match background
      font: {
        color: "var(--foreground)", // Light text color
      },
    };

    // Ensure the div is clean before plotting
    Plotly.purge(chartDivRef.current);
    // Create the plot
    Plotly.newPlot(chartDivRef.current, [trace], layout);

    // Optional: Add resize listener if needed
    // const handleResize = () => {
    //   if (chartDivRef.current) {
    //     Plotly.Plots.resize(chartDivRef.current);
    //   }
    // };
    // window.addEventListener('resize', handleResize);

    // Cleanup function to remove plot and listener on unmount or data change
    return () => {
      // window.removeEventListener('resize', handleResize);
      if (chartDivRef.current) {
        Plotly.purge(chartDivRef.current); // Clean up the plot when component unmounts/rerenders
      }
    };
  }, [data, symbol]); // Re-run effect when data or symbol changes

  return (
    <div ref={chartDivRef} style={{ width: "100%", height: "500px" }}></div>
  );
  // Adjust height as needed
};

export default StockChart;
