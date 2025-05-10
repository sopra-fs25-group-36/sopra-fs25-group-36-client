"use client";

import React, { useState } from "react";
import { Row, Col, Card, Typography, Modal, Image } from "antd";
import {
  PlayCircleOutlined,
  FundOutlined,
  DollarCircleOutlined,
  UploadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import Logo from "@/components/Logo";
import type { ReactNode } from "react";

const { Title, Paragraph } = Typography;

/* ──────────────────────────
   Small presentational tile
   ────────────────────────── */
interface TileProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}

const InstructionTile: React.FC<TileProps> = ({
  title,
  description,
  icon,
  onClick,
}) => (
  <Card
    hoverable
    className="tile"
    onClick={onClick}
    style={{ flex: 1, cursor: "pointer" }}
  >
    <div className="tileIcon">{icon}</div>
    <Title level={4} style={{ marginTop: 0 }}>
      {title}
    </Title>
    <Paragraph>{description}</Paragraph>
  </Card>
);

/* ──────────────────────────
   Main page
   ────────────────────────── */
export default function InstructionPage() {
  /* ---------- image modal state ---------- */
  const images = [
    "/instruction/step-1.png",
    "/instruction/step-2.png",
    "/instruction/step-3.png",
    "/instruction/step-4.png",
    "/instruction/step-5.png",
  ];
  const [visible, setVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");

  const openImage = (src: string) => {
    setImgSrc(src);
    setVisible(true);
  };

  /* ---------- helper fns ---------- */
  // const goto = (path: string) => () => router.push(path);
  // const copyLink = () => navigator.clipboard.writeText(window.location.href);

  /* ---------- tile data ---------- */
  const steps = [
    {
      title: "Round begins",
      description:
        "A 10-second countdown and a live leaderboard appear first so you know where you stand.",
      icon: <PlayCircleOutlined />,
      img: images[0],
    },
    {
      title: "Review prices",
      description:
        "Stocks are grouped by sector, pick one you think is promising! Check details by pressing the stock.",
      icon: <FundOutlined />,
      img: images[1],
    },
    {
      title: "Trade shares",
      description:
        "Enter the shares you want to BUY (left) or SELL (right). Use the buttons to add them to your ticket.",
      icon: <DollarCircleOutlined />,
      img: images[2],
    },
    {
      title: "Submit round",
      description:
        "Click “Submit Round” before the clock hits zero late orders get rejected!",
      icon: <UploadOutlined />,
      img: images[3],
    },
    {
      title: "Track portfolio",
      description:
        "Hit “My Portfolio” anytime to inspect cash, open positions and P/L for every stock.",
      icon: <PieChartOutlined />,
      img: images[4],
    },
  ];

  return (
    <main className="wrapper">
      <Logo />
      <Title level={2}>How to play</Title>

      <Paragraph>
        Outsmart your friends over multiple lightning-fast rounds of trading
      </Paragraph>

      <Row gutter={[24, 24]} className="grid" justify="center">
        {steps.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.title} style={{ display: "flex" }}>
            <InstructionTile
              {...s}
              onClick={() => openImage(s.img)} // ← show modal
            />
          </Col>
        ))}
      </Row>

      {/* ---------- image modal ---------- */}
      <Modal
        open={visible}
        footer={null}
        centered
        onCancel={() => setVisible(false)}
        width={800}
        destroyOnClose
      >
        <Image
          src={imgSrc}
          alt="instruction detail"
          preview={false}
          width="100%"
        />
      </Modal>
    </main>
  );
}
