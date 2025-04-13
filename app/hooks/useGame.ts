import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const useGame = (gameId: number) => {
  const router = useRouter();

  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(300); // 5min

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (round >= 10) {
            setTimeout(() => {
              router.push(`/lobby/${gameId}/leader_board`);
            }, 1000);
          } else {
            setTimeout(() => {
              router.push(`/lobby/${gameId}/game`);
              setRound((prevRound) => prevRound + 1);
              setTimer(300); 
            }, 1000);
          }

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
  };
};
