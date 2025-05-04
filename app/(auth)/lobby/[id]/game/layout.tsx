"use client";
import { usePathname } from "next/navigation";
import {Col, Row} from "antd";
import TransactionList from "@/components/TransactionList";
import React, { useState } from "react";

export default function GameLayout({ children }) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false); // State to toggle column spans
    const toggleLayout = () => {
    setIsExpanded((prev) => !prev); // Toggle between expanded and default layout
  };
    // 1) if we're on /transition, render only the transition page
    if (pathname?.endsWith("/transition")) {
        return <>{children}</>;
    }

    // 2) otherwise, render the two-column transaction + nested children layout
    //    (children here will be the output of page.tsx, which is TransactionList
    //     when on /game—and whatever you pass when in a nested route)
    return (
        <Row>
            <Col span={isExpanded ? 14 : 24}>
                <TransactionList onToggleLayout={toggleLayout} />
            </Col>
            {isExpanded && <Col span={10}>{children}</Col>}
        </Row>
    );
}



// "use client";
// import React, { useState } from "react";
// import { Row, Col, App as AntApp } from "antd";
// import TransactionList from "@/components/TransactionList";
//
// interface GameLayoutProps {
//   children: React.ReactNode;
// }
//
// export default function GameLayout({ children }: GameLayoutProps) {
//   const [isExpanded, setIsExpanded] = useState(false); // State to toggle column spans
//
//   const toggleLayout = () => {
//     setIsExpanded((prev) => !prev); // Toggle between expanded and default layout
//   };
//
//   return (
//     <AntApp>
//       <div style={{ maxWidth: 1400, margin: "20px auto", padding: 2 }}>
//         <Row gutter={24}>
//           {/* Left: Transaction UI */}
//           <Col span={isExpanded ? 14 : 24}>
//             <TransactionList onToggleLayout={toggleLayout} />
//           </Col>
//
//           {/* Right: Nested child content */}
//           {isExpanded && <Col span={10}>{children}</Col>}
//         </Row>
//       </div>
//     </AntApp>
//   );
// }
