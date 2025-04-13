import React, { useEffect, useRef } from "react";
import { Bar } from "@antv/g2plot";

interface BarChartProps {
  data: { name: string; value: number; category: string }[];
  colorMap?: Record<string, string>;
}

const BarChart: React.FC<BarChartProps> = ({ data, colorMap }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Default color mapping for categories
  const defaultColorMap: Record<string, string> = {
    Tech: "#1890ff",
    Finance: "#52c41a",
    Healthcare: "#faad14",
    Energy: "#f5222d",
    Consumer: "#722ed1",
  };
  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  useEffect(() => {
    if (!containerRef.current || !data.length) return;
    const mergedColorMap = { ...defaultColorMap, ...colorMap };
    const config = {
      data,
      xField: "value",
      yField: "name",
      isHorizontal: true,
      seriesField: "category",
      color: ({ category }: { category: string }) =>
        colorMap[category] || "#000",
      label: {
        position: "right",
        // content: (datum: any) => `$${datum.value}`,
        formatter: (datum: any) => usdFormatter.format(datum.value),
      },
      tooltip: {
        showTitle: false,
        formatter: (datum: any) => ({
          name: datum.name,
          //value: `$${datum.value}`,
          value: usdFormatter.format(datum.value),
        }),
      },
      legend: { position: "top" },
    };

    const plot = new Bar(containerRef.current, config);
    plot.render();

    return () => plot.destroy();
  }, [data, colorMap]);

  return <div ref={containerRef} className="bar-chart-container" />;
};

export default BarChart;

// import React, { useEffect, useRef } from "react";
// import { Bar } from "@antv/g2plot";

// interface BarChartProps {
//   data: { name: string; value: number; category: string }[];
//   colorMap?: Record<string, string>;
// }

// const BarChart: React.FC<BarChartProps> = ({ data, colorMap = {} }) => {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // Default color mapping for categories
//   const defaultColorMap: Record<string, string> = {
//     Tech: "#1890ff",
//     Finance: "#52c41a",
//     Healthcare: "#faad14",
//     Energy: "#f5222d",
//     Consumer: "#722ed1",
//   };

//   const usdFormatter = new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//   });

//   useEffect(() => {
//     if (!containerRef.current || !data.length) return;

//     const mergedColorMap = { ...defaultColorMap, ...colorMap };

//     // Create a mapping from stock name to its category color
//     const nameToColorMap: Record<string, string> = {};
//     data.forEach((item) => {
//       nameToColorMap[item.name] = mergedColorMap[item.category] || "#999";
//     });

//     const config = {
//       data,
//       xField: "value",
//       yField: "name",
//       isHorizontal: true,
//       seriesField: "name", // Group by stock name for legend
//       color: ({ name }: { name: string }) => nameToColorMap[name], // Color by category
//       label: {
//         position: "right",
//         formatter: (datum: any) => usdFormatter.format(datum.value),
//       },
//       tooltip: {
//         showTitle: false,
//         formatter: (datum: any) => ({
//           name: datum.name,
//           category: datum.category, // Show category in tooltip
//           value: usdFormatter.format(datum.value),
//         }),
//       },
//       legend: {
//         position: "top",
//         itemName: {
//           formatter: (text: string) => text, // Keep stock symbols in legend
//         },
//       },
//     };

//     const plot = new Bar(containerRef.current, config);
//     plot.render();

//     return () => plot.destroy();
//   }, [data, colorMap]);

//   return <div ref={containerRef} className="bar-chart-container" />;
// };

// export default BarChart;
