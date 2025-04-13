import React, { useEffect, useRef } from "react";
import { Pie } from "@antv/g2plot";

interface PieChartProps {
  data: { type: string; value: number }[];
  colorMap?: Record<string, string>;
}

const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  colorMap = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default colors if none provided
  const defaultColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
  };

  const mergedColorMap = { ...defaultColorMap, ...colorMap };

  useEffect(() => {
    if (!containerRef.current || !data.length) return;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const piePlot = new Pie(containerRef.current, {
      data,
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      innerRadius: 0.6,
      color: ({ type }: { type: string }) => mergedColorMap[type] || "#999",

      label: {
        type: "outer",
        content: ({ type, value }) => `${type}: $${value.toLocaleString()}`,
      },

      tooltip: {
        showTitle: false,
        formatter: ({ type, value }: any) => ({
          name: type,
          value: `$${value.toLocaleString()}`,
        }),
      },

      statistic: {
        title: {
          content: "Total",
          style: {
            fontSize: 20,
            color: getComputedStyle(document.documentElement)
              .getPropertyValue("--foreground")
              .trim(),
          },
        },
        content: {
          content: `$${total.toLocaleString()}`,
          style: {
            fontSize: 24,
            fontWeight: "bold",
            color: getComputedStyle(document.documentElement)
              .getPropertyValue("--foreground")
              .trim(),
          },
        },
      },

      legend: {
        position: "top",
      },
    });

    piePlot.render();

    return () => piePlot.destroy();
  }, [data, colorMap]);

  return <div ref={containerRef} className="pie-chart-container" />;
};

export default PieChartComponent;
