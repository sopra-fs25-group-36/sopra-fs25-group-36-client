import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";

export const useAuth = () => {
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (token === null) {
      return; // Wait for local storage to load
    }

    console.log("Token:", token); // Debug: Log the token
    if (!token) {
      console.log("No token found. Redirecting to login...");
      setIsAuthenticated(false);
      router.push("/login");
    } else {
      console.log("Token found. User is authenticated.");
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Mark loading as complete
  }, [token, router]);

  return { isAuthenticated, isLoading }; // Return an object
};