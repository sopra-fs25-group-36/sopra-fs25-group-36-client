"use client";
import React, { useState } from "react";
import { Row, Col, App as AntApp } from "antd";
import TransactionList from "@/components/TransactionList";

interface GameLayoutProps {
    children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
    const [isExpanded, setIsExpanded] = useState(false); // State to toggle column spans

    const toggleLayout = () => {
        setIsExpanded((prev) => !prev); // Toggle between expanded and default layout
    };


    return (
        <AntApp>
            <div style={{ maxWidth: 1400, margin: "20px auto", padding: 2 }}>
                {/* You can keep your Logo here or in a shared Header */}
                <Row gutter={24}>
                    {/* Left: always show transaction UI */}
                    <Col span={isExpanded ? 16 : 24}>
                        <TransactionList onToggleLayout={toggleLayout} />
                    </Col>

                    {/* Right: Nested page */}
                    {isExpanded && (
                        <Col span={8}>
                            {children}
                        </Col>
                    )}
                </Row>
            </div>
        </AntApp>
    );
}
