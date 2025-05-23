import { useEffect, useState } from "react";

interface WindowSize {
  width: number;
  height: number;
}

interface UseWindowSizeReturn {
  windowSize: WindowSize;
  isMobile: boolean;
  isDesktop: boolean;
}

const useWindowSize = (): UseWindowSizeReturn => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: globalThis.innerWidth,
        height: globalThis.innerHeight,
      });
    }
    if (typeof window !== "undefined") {
      globalThis.addEventListener("resize", handleResize);
      handleResize();
    }
    return () => globalThis.removeEventListener("resize", handleResize);
  }, []);

  return {
    windowSize,
    isMobile: windowSize.width < 768,
    isDesktop: windowSize.width >= 768,
  };
};

export default useWindowSize;
