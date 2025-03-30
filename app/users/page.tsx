"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Input, Typography } from "antd";
import Logo from "@/components/Logo";

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);

  // Use the useAuth hook to check authentication
  const isAuthenticated = useAuth();

  // useLocalStorage hook example use
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<number>("id", 0); // Add this line to clear the user ID

  const checkLogin = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/login");
      return;
    }
  };
  useEffect(() => {
    checkLogin();
    const fetchUsers = async () => {
      try {
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      }
    };
    fetchUsers();
  }, [apiService]);

  const handleLogout = async (): Promise<void> => {
    const id = localStorage.getItem("id");

    try {
      // Call the logout endpoint if currentUser exists
      if (id) {
        await apiService.post<User>(`/logout/${id}`, {});
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearToken();
      clearUserId(); // Clear the user ID from local storage
      router.push("/login");
    }
  };

  if (!isAuthenticated) {
    return null; // Render nothing while redirecting
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users: User[] = await apiService.get<User[]>("/users");
        setUsers(users);
        console.log("Fetched users:", users);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      }
    };

    fetchUsers();
  }, [apiService]);

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", padding: 2 }}>
      <Logo />
      <Title level={2} style={{ textAlign: "center" }}>
        Welcome !
      </Title>
      <Button
        type="primary"
        variant="solid"
        onClick={() => router.push("/NewGame")}
        block
        style={{ height: "60px", fontSize: "20px", padding: "0 30px" }}
      >
        New Game
      </Button>
      <Button
        type="primary"
        variant="solid"
        onClick={() => router.push("/JoinGame")}
        block
        style={{ height: "60px", fontSize: "20px", padding: "0 30px" }}
      >
        Join Game
      </Button>
    </div>
  );
};

export default Dashboard;
