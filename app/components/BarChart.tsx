// components/BarChart.tsx
"use client";
import React, { useEffect, useRef } from "react";
import { Bar } from "@antv/g2plot";

interface BarChartProps {
  data: { name: string; value: number; category: string }[];
  colorMap?: Record<string, string>;
}

const BarChart: React.FC<BarChartProps> = ({ data, colorMap = {} }) => {
  // Ensure containerRef.current is either HTMLDivElement or null
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default category colors
  const defaultColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return; // narrow type to HTMLDivElement

    // Merge default and provided color maps
    const mergedColorMap = { ...defaultColorMap, ...colorMap };

    // Build config
    const config = {
      data,
      xField: "value",
      yField: "name",
      isHorizontal: true,
      seriesField: "category",        // group/break out by category
      color: ({ category }: { category: string }) =>
          mergedColorMap[category] || "#ccc",
      label: {
        position: "right" as const,
        formatter: (datum: any) => `\$${datum.value.toFixed(2)}`,
      },
      tooltip: {
        showTitle: false,
        formatter: (datum: any) => ({
          name: datum.name,
          value: `\$${datum.value.toFixed(2)}`,
        }),
      },
      legend: {
        position: "top" as const,
        itemName: {
          formatter: (text: string) => text,
        },
      },
    };

    // Instantiate and render plot
    const plot = new Bar(el, config);
    plot.render();

    // Cleanup
    return () => {
      plot.destroy();
    };
  }, [data, colorMap]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default BarChart;
