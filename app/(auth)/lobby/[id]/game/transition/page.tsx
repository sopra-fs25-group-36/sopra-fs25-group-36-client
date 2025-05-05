"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Typography, Spin } from "antd";
import { motion } from "framer-motion";

const TransitionPage: React.FC = () => {
  const router = useRouter();
  const { id: gameId } = useParams();

  useEffect(() => {
    // After a short delay, navigate to the leaderboard
    const timeout = setTimeout(() => {
      router.replace(`/lobby/${gameId}/leader_board`);
    }, 2500);
    return () => clearTimeout(timeout);
  }, [router, gameId]);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #b1e6c2, #b1e6d8)",
        color: "white",
      }}
    >
      {/* Coin animation */}
      <motion.div
        className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl mb-8"
        animate={{ rotateY: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        💰
      </motion.div>

      {/* Message */}
      <Typography.Title
        level={3}
        style={{ color: "var(--foreground)", marginBottom: 0 }}
      >
        Transactions are in!
      </Typography.Title>
      <Typography.Text style={{ color: "var(--foreground)", marginBottom: 16 }}>
        Round has ended. Loading leaderboard...
      </Typography.Text>

      {/* Spinner below message */}
      <Spin size="large" />
    </div>
  );
};

export default TransitionPage;
