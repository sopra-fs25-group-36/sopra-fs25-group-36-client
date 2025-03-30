"use client";

import { Lobby } from "@/components/Lobby";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";

export default function LobbyPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { value: currentUser } = useLocalStorage<User | null>(
    "currentUser",
    null
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="page">
      <main className="main">
        <Lobby />
      </main>
    </div>
  );
}
