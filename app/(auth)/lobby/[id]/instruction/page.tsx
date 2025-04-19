/* app/lobby/[id]/instruction/page.tsx */
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Row, Col, Card, Typography, Button, Modal, Image } from "antd"; // ← added Modal, Image
import {
  PlayCircleOutlined,
  FundOutlined,
  DollarCircleOutlined,
  UploadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import Logo from "@/components/Logo";
import type { ReactNode } from "react";

const { Title, Paragraph, Text } = Typography;

/* ──────────────────────────
   Small presentational tile
   ────────────────────────── */
interface TileProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;            // ← add click handler
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
    onClick={onClick}               // ← hook up click
    style={{ flex: 1, cursor: "pointer" }} // make whole card clickable
  >
    <div className="tileIcon">{icon}</div>
    <Title level={4} style={{ marginTop: 0 }}>
      {title}
    </Title>
    <Paragraph>{description}</Paragraph>

    <style jsx>{`
      .tile {
        border-radius: 16px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        min-height: 240px;
        transition: transform 0.1s ease;
      }
      .tile:hover {
        transform: translateY(-4px);
      }
      .tileIcon {
        font-size: 40px;
        line-height: 1;
        margin-bottom: 16px;
        color: var(--ant-primary-color);
      }
    `}</style>
  </Card>
);

/* ──────────────────────────
   Main page
   ────────────────────────── */
export default function InstructionPage() {
  const router = useRouter();
  const { id: lobbyId } = useParams();

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
  const goto = (path: string) => () => router.push(path);
  const copyLink = () => navigator.clipboard.writeText(window.location.href);

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
      <Title level={2} className="heading">
        How to play
      </Title>

      <Paragraph className="tagline">
        Outsmart your friends over multiple lightning-fast rounds of trading
      </Paragraph>

      <Row gutter={[24, 24]} className="grid" justify="center">
        {steps.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.title} style={{ display: "flex" }}>
            <InstructionTile
              {...s}
              onClick={() => openImage(s.img)}        // ← show modal
            />
          </Col>
        ))}
      </Row>

      {/* ---------- buttons ---------- */}
      <div className="actions">
        <Button onClick={copyLink}>Copy this page 📋</Button>
        <Button
          type="primary"
          size="large"
          onClick={goto(`/lobby/${lobbyId}/leader_board`)}
        >
          Got it - take me to the game
        </Button>
      </div>

      <Text type="secondary" className="footerNote">
        You can reopen this guide from the game menu at any time.
      </Text>

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

      {/* ─────────────────── styles ─────────────────── */}
      <style jsx>{`
        .wrapper {
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 16px 64px;
          text-align: center;
        }
        .heading {
          margin-top: 16px !important;
          font-weight: 700;
        }
        .tagline {
          font-size: 16px;
          margin-bottom: 48px;
          color: #8a8a8a;
        }
        .grid {
          margin-bottom: 48px;
        }
        .actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 60px;
          margin-bottom: 24px;
        }
        .footerNote {
          display: block;
          margin-top: 16px;
        }
      `}</style>
    </main>
  );
}
