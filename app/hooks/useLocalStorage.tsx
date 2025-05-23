import { useState, useEffect } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
}

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T
): LocalStorage<T> {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const set = (newVal: T) => {
    setValue(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(newVal));
    }
  };

  const clear = () => {
    setValue(defaultValue);
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  };

  return { value, set, clear };
}
