"use client";

import Account from "@/components/Account";
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
      {isAuthenticated && <Account />}
      {children}
    </div>
  );
}
