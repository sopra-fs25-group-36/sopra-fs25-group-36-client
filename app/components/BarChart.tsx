"use client";
import React, { useEffect, useRef } from "react";
import { Bar, BarOptions } from "@antv/g2plot";

interface BarChartProps {
  data: { name: string; value: number; category: string }[];
  colorMap?: Record<string, string>;
}

const BarChart: React.FC<BarChartProps> = ({ data, colorMap = {} }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const defaultColorMap: Record<string, string> = {
      Tech: "#1890ff",
      Finance: "#52c41a",
      Healthcare: "#faad14",
      Energy: "#f5222d",
      Consumer: "#722ed1",
    };

    const mergedColorMap = { ...defaultColorMap, ...colorMap };

    const config: BarOptions = {
      data,
      xField: "value",
      yField: "name",
      // isHorizontal: true,
      seriesField: "category",
      // color: ({ category }: { category?: string }) =>
      //   category ? mergedColorMap[category] || "#11e098" : "#11e098",
      label: false,
      // label: {
      //   position: "right",
      //   formatter: (datum) => `\$${(datum.value as number).toFixed(2)}`,
      // },
      // label: {
      //   position: "right",
      //   formatter: (datum: Record<string, unknown>) => {
      //     const value = datum.value as number;
      //     return `\$${value.toFixed(2)}`;
      //   },
      // },
      // tooltip: {
      //   showTitle: false,
      //   formatter: (datum: Record<string, unknown>) => ({
      //     name: datum.name as string,
      //     value: `\$${(datum.value as number).toFixed(2)}`,
      //   }),
      tooltip: {
        showTitle: false,
        formatter: (datum) => ({
          name: datum.name as string,
          value: `\$${(datum.value as number).toFixed(2)}`,
        }),
      },
      legend: {
        position: "top",
        itemName: {
          formatter: (text: string) => text,
        },
      },
    };

    const plot = new Bar(el, config);
    plot.render();

    return () => {
      plot.destroy();
    };
  }, [data, colorMap]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default BarChart;
