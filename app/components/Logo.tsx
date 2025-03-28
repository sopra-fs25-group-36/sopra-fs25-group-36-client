"use client"; // Mark this component as a Client Component

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define the props interface
interface LogoProps {
  width?: number;
  height?: number;
}

const Logo = ({ width = 632 / 3, height = 209 / 3 }: LogoProps) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Detect the theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkTheme(mediaQuery.matches);

    const handleThemeChange = (event: MediaQueryListEvent) => {
      setIsDarkTheme(event.matches);
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      <Link href="/">
        <Image
          src={isDarkTheme ? "/Stockico_dark.png" : "/Stockico_light.png"}
          alt="Game Logo"
          width={width} // Use the width prop
          height={height} // Use the height prop
          unoptimized // Disable default optimizations (e.g., blur-up placeholder)
          style={{ cursor: "pointer" }}
        />
      </Link>
    </div>
  );
};

export default Logo;
