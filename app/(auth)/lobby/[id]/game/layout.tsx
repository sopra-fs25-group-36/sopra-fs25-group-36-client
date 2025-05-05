// "use client";
// import { usePathname } from "next/navigation";
// import { Col, Row } from "antd";
// import TransactionList from "@/components/TransactionList";
// import React, { useState } from "react";

// export default function GameLayout({ children }) {
//   const pathname = usePathname();
//   const [isExpanded, setIsExpanded] = useState(false);
//   const toggleLayout = () => {
//     setIsExpanded((prev) => !prev);
//   };
//   // 1) if we're on /transition, render only the transition page
//   if (pathname?.endsWith("/transition")) {
//     return <>{children}</>;
//   }

//   return (
//     <Row>
//       <Col span={isExpanded ? 14 : 24}>
//         <TransactionList onToggleLayout={toggleLayout} />
//       </Col>
//       {isExpanded && <Col span={10}>{children}</Col>}
//     </Row>
//   );
// }

"use client";
import { usePathname } from "next/navigation";
import { Col, Row } from "antd";
import TransactionList from "@/components/TransactionList";
import React, { useState } from "react";

interface GameLayoutProps {
  children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleLayout = () => {
    setIsExpanded((prev) => !prev);
  };

  if (pathname?.endsWith("/transition")) {
    return <>{children}</>;
  }

  return (
    <Row>
      <Col span={isExpanded ? 14 : 24}>
        <TransactionList onToggleLayout={toggleLayout} />
      </Col>
      {isExpanded && <Col span={10}>{children}</Col>}
    </Row>
  );
}
