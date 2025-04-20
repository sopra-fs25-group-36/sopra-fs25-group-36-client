"use client";

import UserAccount from "@/components/UserAccount";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <div style={{ position: "relative" }}>
      {isAuthenticated && <UserAccount />}
      {children}
    </div>
  );
}
