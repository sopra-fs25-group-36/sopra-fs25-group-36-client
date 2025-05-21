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
      <Row style={{ height: "100%", display: "flex" }}>
        <Col span={isExpanded ? 14 : 24} style={{ height: "100%" }}>
          <TransactionList onToggleLayout={toggleLayout} />
        </Col>
        {isExpanded && (
            <Col span={10} style={{ height: "100%" }}>
              {children}
            </Col>
        )}
      </Row>

  );
}
