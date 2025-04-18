"use client";
import React from "react";
import { Row, Col, App as AntApp } from "antd";
import TransactionList from "@/components/TransactionList";

interface GameLayoutProps {
    children: React.ReactNode;
}

export default function GameLayout({ children }: GameLayoutProps) {
    return (
        <AntApp>
            <div style={{ maxWidth: 1200, margin: "20px auto", padding: 2 }}>
                {/* You can keep your Logo here or in a shared Header */}
                <Row gutter={24}>
                    {/* Left: always show transaction UI */}
                    <Col span={12}>
                        <TransactionList />
                    </Col>

                    {/* Right: render whatever nested page is active */}
                    <Col span={12}>
                        {children}
                    </Col>
                </Row>
            </div>
        </AntApp>
    );
}
