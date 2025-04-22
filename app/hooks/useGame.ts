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

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiDomain } from "@/utils/domain";

export const useGame = (gameId: number) => {
  const router = useRouter();
  const [round, setRound] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch game state from API
  const fetchGameState = async () => {
    try {
      const response = await fetch(`${getApiDomain()}/game/${gameId}/`);
      if (!response.ok) {
        throw new Error('Failed to fetch game state');
      }
      const data = await response.json();
      setRound(data.currentRound);
      // You might want to calculate timer based on your game logic
      setTimer(300); // Default timer or calculate from API data
    } catch (error) {
      console.error('Error fetching game state:', error);
      // Fallback to localStorage if API fails
      const savedRound = typeof window !== 'undefined' ? localStorage.getItem("round") : null;
      setRound(savedRound ? parseInt(savedRound, 10) : 1);
      setTimer(300);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchGameState();
  }, [gameId]);

  // Timer logic
  useEffect(() => {
    if (round === null || timer === null) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);

          // Fetch updated game state when timer expires
          fetchGameState().then(() => {
            if (round >= 10) {
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

    return () => clearInterval(interval);
  }, [round, router, gameId]);

  return {
    round,
    timer,
    isLoading,
  };
};
