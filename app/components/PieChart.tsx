// "use client";

// import React, { useEffect, useRef, useMemo } from "react";
// import { Pie } from "@ant-design/plots";

// interface PieChartProps {
//   data: { type: string; value: number }[];
//   colorMap: Record<string, string>;
// }

// const PieChart: React.FC<PieChartProps> = ({ data, colorMap }) => {
//   const usdFormatter = useMemo(
//     () =>
//       new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//       }),
//     []
//   );
//   // ① No explicit `: PieConfig` here
//   const config = {
//     data,
//     angleField: "value",
//     colorField: "type",
//     radius: 1,
//     color: (datum: { type: string }) => colorMap[datum.type] || "#ccc",
//   };

//   // ② Cast to PieConfig only at the spread site
//   return <Pie {...config} />;
// };

// export default PieChart;

"use client";

import React, { useEffect, useRef } from "react";
import { Pie, PieOptions } from "@antv/g2plot";

interface PieChartProps {
  data: { type: string; value: number }[];
  colorMap?: Record<string, string>;
}

const PieChart: React.FC<PieChartProps> = ({ data, colorMap = {} }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Default color mapping
    //const defaultColorMap: Record<string, string> = {
      //Tech: "#1890ff",
      //Finance: "#52c41a",
      //Healthcare: "#faad14",
      //Energy: "#f5222d",
      //Consumer: "#722ed1",
    //};

    // Merge the provided colorMap with the default one
    //const mergedColorMap = { ...defaultColorMap, ...colorMap };

    const config: PieOptions = {
      data,
      angleField: "value",
      colorField: "type",
      radius: 1,
      // color: (datum) => {
      //   const type = datum["type"] as string;
      //   return mergedColorMap[type] || "#ccc"; // Use the color map or default
      // },
      label: false,
      // label: {
      //   content: (datum) => `${datum.type}`, // Show only the type
      // },
      // tooltip: {
      //   showTitle: false,
      //   formatter: (datum) => ({
      //     name: datum.name as string,
      //     value: `\$${(datum.value as number).toFixed(2)}`,
      //   }),
      // },
      legend: {
        position: "top",
        itemName: {
          formatter: (text: string) => text,
        },
      },
    };

    const plot = new Pie(el, config);
    plot.render();

    return () => {
      plot.destroy();
    };
  }, [data, colorMap]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};

export default PieChart;
