/* components/InstructionTile.tsx */
import React from "react";
import { Card, Typography } from "antd";
import type { ReactNode } from "react";

const { Title, Paragraph } = Typography;

interface Props {
  title: string;
  description: string;
  icon: ReactNode;
}

const InstructionTile: React.FC<Props> = ({ title, description, icon }) => (
  <Card
    hoverable
    style={{
      borderRadius: 16,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    }}
  >
    <div
      style={{
        fontSize: 40,
        lineHeight: 1,
        marginBottom: 16,
        color: "var(--ant-primary-color)",
      }}
    >
      {icon}
    </div>

    <Title level={4} style={{ marginTop: 0 }}>
      {title}
    </Title>
    <Paragraph>{description}</Paragraph>
  </Card>
);

export default InstructionTile;
