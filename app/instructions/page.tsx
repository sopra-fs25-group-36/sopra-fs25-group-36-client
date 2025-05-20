"use client";

import React, { useState } from "react";
import { Row, Col, Card, Typography, Modal, Image } from "antd";
import {
  PlayCircleOutlined,
  FundOutlined,
  DollarCircleOutlined,
  UploadOutlined,
  PieChartOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Logo from "@/components/Logo";
import type { ReactNode } from "react";

const { Title, Paragraph } = Typography;

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

export default function InstructionPage() {
  const images = [
    "/instruction/step-1.png",
    "/instruction/step-2.png",
    "/instruction/step-3.png",
    "/instruction/step-4.png",
    "/instruction/step-5.png",
    "/instruction/step-6.png",
  ];
  const [visible, setVisible] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");

  const openImage = (src: string) => {
    setImgSrc(src);
    setVisible(true);
  };

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
        "Stocks are grouped by sector, pick one you think is promising! Check details by pressing the stock. As well you can see relevant information about the company.",
      icon: <FundOutlined />,
      img: images[1],
    },
    {
      title: "Trade shares",
      description:
        "Enter the shares you want to BUY (left) or SELL (right). You can not BUY more than Your available Cash, as well you can not SELL more than the number of stocks you have already in your Portfolio.",
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
    {
      title: "See instructions",
      description:
        "Hit “Instructions” anytime to open in new windows the Game's Instructions.",
      icon: <FileTextOutlined />,
      img: images[5],
    },
  ];

  return (
    <main className="wrapper">
      <Logo />
      <br></br>
      <Title level={1}>How to play</Title>
      <br></br>
      <Paragraph>
        Outsmart your friends over multiple lightning-fast rounds of trading
      </Paragraph>
      <br></br>
      <Row gutter={[24, 24]} className="grid" justify="center">
        {steps.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.title} style={{ display: "flex" }}>
            <InstructionTile {...s} onClick={() => openImage(s.img)} />
          </Col>
        ))}
      </Row>

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
