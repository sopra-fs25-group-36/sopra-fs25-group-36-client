import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";

export const useAuth = () => {
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<number>("id", 0);  // Add user ID
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token === null || id === 0) {
      return; // Wait for localStorage to load
    }

    // If token or id are missing, redirect to login
    console.log("Token:", token); // Debug: Log the token
    if (!token || !id) {
      console.log("No token found. Redirecting to login...");
      setIsAuthenticated(false);
      router.push("/login");
    } else {
      console.log("Token found. User is authenticated.");
      setIsAuthenticated(true);
    }

    setIsLoading(false); // Mark loading as complete
  }, [token, id, router]); // Ensure both token and id are dependencies

  return { isAuthenticated, isLoading }; // Return the current authentication state
};
