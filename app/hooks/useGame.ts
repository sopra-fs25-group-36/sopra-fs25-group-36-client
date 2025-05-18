import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getApiDomain } from "@/utils/domain";

export const useGame = (gameId: number) => {
  const router = useRouter();
  const [round, setRound] = useState<number>(1);
  const [timer, setTimer] = useState<number>(120);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Wrap fetchGameState in useCallback to memoize it
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch(`${getApiDomain()}/game/${gameId}/round`);
      if (!response.ok) throw new Error("Failed to fetch game state");
      const data = await response.json();
      setRound(data.currentRound);
      setTimer(Math.floor(data.remainingTime / 1000));
      return data.currentRound;
    } catch (error) {
      console.error("❌ Error fetching game state:", error);
      const savedRound = typeof window !== "undefined" ? localStorage.getItem("round") : null;
      const fallbackRound = savedRound ? parseInt(savedRound, 10) : 1;
      setRound(fallbackRound);
      setTimer(120);
      return fallbackRound;
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  // Timer management
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (pathname?.endsWith("/transition")) {
            console.log("⏳ Timer ended but we're already on the transition page. No redirect.");
            return 0;
          }
          fetchGameState().then((newRound) => {
            if (newRound >= 10) {
              // router.push(`/lobby/${gameId}/leader_board`);
              router.push(`/lobby/${gameId}/endgame`);
            } else {
              router.push(`/lobby/${gameId}/game/transition`);
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [round, gameId, router, pathname, fetchGameState]);

  useEffect(() => {
    console.log("🔁 ROUND LOG FROM CLIENT:", round);
  }, [round]);

  return {
    round,
    timer,
    isLoading,
  };
};