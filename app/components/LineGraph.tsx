import React, { useEffect, useRef } from "react";
import { Line } from "@antv/g2plot";

interface LineGraphProps {
  datasets: {
    label: string;
    data: number[];
  }[];
}

const LineGraph: React.FC<LineGraphProps> = ({ datasets }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      console.error("Container not found for the chart");
      return;
    }

    // Predefined colors for each dataset
    const colors = [
      "#11e098",
      "#ff3d67",
      "#9966ff",
      "#4bc0c0",
      "#ff8c42",
      "#ffce56",
      "#cc65fe",
      "#ff6384",
      "#36a2eb",
    ];

    // Prepare the data for G2Plot, including labels and colors for each dataset
    const formattedData = datasets.flatMap((dataset, index) =>
      dataset.data.map((value, roundIndex) => ({
        round: roundIndex + 1, // X-axis (Round)
        value,
        label: dataset.label, // Y-axis (Stock Price or Metric)
        color: colors[index % colors.length], // Unique color for each dataset
      }))
    );

    const chart = new Line(containerRef.current, {
      data: formattedData,
      xField: "round",
      yField: "value",
      seriesField: "label",
      color: colors.slice(0, datasets.length),
      xAxis: {
        type: "linear", // Change to 'linear' for continuous axis
        min: 1, // Start from 1
        max: 10, // End at 10
        tickCount: 10, // Customize number of ticks for clarity
        label: {
          formatter: (val) => {
            const value = Number(val); // Ensure val is treated as a number
            return !isNaN(value) ? value.toFixed(0) : val; // Only apply toFixed if it's a valid number
          },
        },
      },

      line: {
        size: 2,
      },
      point: {
        size: 4,
        shape: "circle",
        style: {
          fill: "white",
          stroke: ({ color }) => color,
          lineWidth: 2,
        },
      },
      tooltip: {
        showTitle: true,
        title: (title) => `Round ${title}`,
        showMarkers: true,
        shared: false,
        customContent: (title, items) => {
          return `
            <div class="custom-tooltip">
              <h4 class="tooltip-title">Round ${title}</h4>
              <div class="tooltip-item">
                <span class="tooltip-marker" style="background:${items[0]?.color || "#999"};"></span>
                <span class="tooltip-label">${items[0]?.data?.label || ""}: </span>
                <span class="tooltip-value">${items[0]?.value || ""}</span>
              </div>
            </div>
          `;
        },
        domStyles: {
          "g2-tooltip": {
            padding: "8px 12px",
            fontSize: "12px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            borderRadius: "4px",
          },
          "g2-tooltip-title": {
            marginBottom: "4px",
            fontWeight: "bold",
          },
          "custom-tooltip": {
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          },
          "tooltip-item": {
            display: "flex",
            alignItems: "center",
            gap: "8px",
          },
          "tooltip-marker": {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
          },
          "tooltip-label": {
            color: "#666",
          },
          "tooltip-value": {
            fontWeight: "bold",
          },
        },
      },
      legend: {
        position: "top-right",
      },
      responsive: true,
    });

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [datasets]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "400px",
        width: "100%",
        border: "1px solid #ccc",
      }}
    />
  );
};

export default LineGraph;
