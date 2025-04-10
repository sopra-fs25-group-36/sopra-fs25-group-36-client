// "use client";
//
// import React from "react";
// import dynamic from "next/dynamic";
//
// // Dynamically import Pie to avoid SSR + typing conflicts
// const Pie = dynamic(() => import("@ant-design/charts").then(mod => mod.Pie), {
//     ssr: false,
// });
//
// interface PieData {
//     type: string;
//     value: number;
// }
//
// interface Props {
//     data: PieData[];
// }
// interface PieChartComponentProps {
//     config: any; // We’ll use `any` here to avoid deep TS pain
// }
//
// const categoryColorMap: Record<string, string> = {
//     Tech: "#1890ff",
//     Finance: "#52c41a",
//     Healthcare: "#faad14",
//     Energy: "#f5222d",
//     Consumer: "#722ed1",
// };
//
// const PieChartComponent: React.FC<Props> = ({ data }) => {
//     const config = {
//         data,
//         angleField: "value",
//         colorField: "type",
//         radius: 1,
//         innerRadius: 0.5,
//         color: data.map((d) => categoryColorMap[d.type] || "#999"),
//
//         // ✅ Labels using officially supported layout
//         label: {
//             type: "outer",
//             content: (datum: PieData) =>
//                 `${datum.type}: $${datum.value.toLocaleString()}`,
//         },
//
//         // ✅ Tooltips
//         tooltip: {
//             formatter: (datum: PieData) => ({
//                 name: datum.type,
//                 value: `$${datum.value.toLocaleString()}`,
//             }),
//         },
//
//         // ✅ Enable interaction
//         interactions: [{ type: "element-active" }],
//     };
//
//     // ✅ Final: Cast to any to prevent TS from exploding
//     return <Pie {...(config as any)} />;
// };
//
// export default PieChartComponent;
"use client";

import React from "react";
import { Pie } from "@ant-design/charts";

interface PieChartComponentProps {
    config: any; // You can replace this with `PieConfig` if typing becomes stable
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ config }) => {
    return <Pie {...config} />;
};

export default PieChartComponent;
