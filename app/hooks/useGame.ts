// // import { useState, useEffect } from "react";
// // import { useRouter } from "next/navigation";

// // export const useGame = (gameId: number) => {
// //   const router = useRouter();
// //   const [round, setRound] = useState(1);
// //   const [timer, setTimer] = useState(300); // 5min

// //   useEffect(() => {
// //     console.log("🔁 ROUND LOG FROM CLIENT:", round);
// //     }, [round]);

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setTimer((prev) => {
// //         if (prev <= 1) {
// //           clearInterval(interval);

// //           if (round >= 10) {
// //             setTimeout(() => {
// //               router.push(`/lobby/${gameId}/leader_board`);
// //             }, 1000);
// //           } else {
// //             setTimeout(() => {
// //               router.push(`/lobby/${gameId}/game`);
// //               setRound((prevRound) => prevRound + 1);
// //               setTimer(300); 
// //             }, 1000);
// //           }

// //           return 0;
// //         }


// //         return prev - 1;
// //       });
// //     }, 1000);

// //     return () => clearInterval(interval);
// //   }, [round, router, gameId]);

// //   return {
// //     round,
// //     timer,
// //   };
// // };

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getApiDomain } from "@/utils/domain";

export const useGame = (gameId: number) => {
  const router = useRouter();
  const [round, setRound] = useState<number>(1);
  const [timer, setTimer] = useState<number>(300); // Default to 5 minutes
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGameState = async () => {
    try {
      const response = await fetch(`${getApiDomain()}/game/${gameId}/`);
      if (!response.ok) throw new Error("Failed to fetch game state");
      const data = await response.json();
      setRound(data.currentRound);
      setTimer(300); // or calculate from data if needed
      return data.currentRound;
    } catch (error) {
      console.error("❌ Error fetching game state:", error);
      const savedRound = typeof window !== "undefined" ? localStorage.getItem("round") : null;
      const fallbackRound = savedRound ? parseInt(savedRound, 10) : 1;
      setRound(fallbackRound);
      setTimer(300);
      return fallbackRound;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Timer management
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          fetchGameState().then((newRound) => {
            if (newRound >= 10) {
              router.push(`/lobby/${gameId}/leader_board`);
            } else {
              router.push(`/lobby/${gameId}/game`);
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [round, gameId, router]);

  useEffect(() => {
    console.log("🔁 ROUND LOG FROM CLIENT:", round);
  }, [round]);

  return {
    round,
    timer,
    isLoading,
  };
};
