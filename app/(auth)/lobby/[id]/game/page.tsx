"use client";

import React from "react";
import { Typography } from "antd";

const GamePage: React.FC = () => {
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <Typography.Title level={2}>
        This is the initialized game page.
      </Typography.Title>
    </div>
  );
};

export default GamePage;
