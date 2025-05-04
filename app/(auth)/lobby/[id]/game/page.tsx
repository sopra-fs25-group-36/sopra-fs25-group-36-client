"use client";
import React from "react";
import { Spin, Typography } from "antd";
import { useParams } from "next/navigation";
import usePlayerState from "@/hooks/usePlayerState";
import Portfolio from "@/components/Portfolio";

const { Title } = Typography;

export default function GamePage() {
  const { id } = useParams();
  const gameId =
    typeof id === "string"
      ? id
      : Array.isArray(id) && id.length > 0
        ? id[0]
        : "";

  const { player, isLoading, error } = usePlayerState(gameId);

  if (isLoading) return <Spin tip="Loading portfolio…" size="large" />;
  if (error || !player) return <div>Error loading portfolio</div>;

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: "center" }}>
        <Title level={2}>Your Portfolio</Title>
      </div>
      <Portfolio player={player!} />
    </>
  );
}
