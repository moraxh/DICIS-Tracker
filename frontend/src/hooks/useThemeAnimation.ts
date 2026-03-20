"use client";

import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "@/context/ThemeProvider";

const isBrowser = typeof window !== "undefined";

const injectBaseStyles = () => {
  if (isBrowser) {
    const styleId = "theme-switch-base-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      const isHighResolution =
        window.innerWidth >= 3000 || window.innerHeight >= 2000;

      style.textContent = `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
          ${isHighResolution ? "transform: translateZ(0);" : ""}
        }
        
        ${
          isHighResolution
            ? `
        ::view-transition-group(root),
        ::view-transition-image-pair(root),
        ::view-transition-old(root),
        ::view-transition-new(root) {
          backface-visibility: hidden;
          perspective: 1000px;
          transform: translate3d(0, 0, 0);
        }
        `
            : ""
        }
      `;
      document.head.appendChild(style);
    }
  }
};

export interface UseThemeAnimationOptions {
  duration?: number;
  easing?: string;
  pseudoElement?: string;
}

export interface UseThemeAnimationReturn {
  ref: React.RefObject<HTMLButtonElement | null>;
  toggleThemeWithAnimation: () => Promise<void>;
  theme: string | undefined;
  resolvedTheme: string | undefined;
  setTheme: (theme: string) => void;
}

export const useThemeAnimation = (
  options?: UseThemeAnimationOptions,
): UseThemeAnimationReturn => {
  const {
    duration: propsDuration = 750,
    easing = "ease-in-out",
    pseudoElement = "::view-transition-new(root)",
  } = options || {};

  const { theme, setTheme, resolvedTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);

  const isHighResolution =
    isBrowser && (window.innerWidth >= 3000 || window.innerHeight >= 2000);

  const duration = isHighResolution
    ? Math.max(propsDuration * 0.8, 500)
    : propsDuration;

  useEffect(() => {
    injectBaseStyles();
  }, []);

  const toggleThemeWithAnimation = async () => {
    if (
      !ref.current ||
      !(document as any).startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const themeOrder: Array<"light" | "dark" | "system"> = [
        "light",
        "dark",
        "system",
      ];
      const currentIndex = themeOrder.indexOf(
        theme as "light" | "dark" | "system",
      );
      const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
      setTheme(nextTheme);
      return;
    }

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    const topLeft = Math.hypot(x, y);
    const topRight = Math.hypot(window.innerWidth - x, y);
    const bottomLeft = Math.hypot(x, window.innerHeight - y);
    const bottomRight = Math.hypot(
      window.innerWidth - x,
      window.innerHeight - y,
    );

    const maxRadius = Math.max(topLeft, topRight, bottomLeft, bottomRight);

    const themeOrder: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themeOrder.indexOf(
      theme as "light" | "dark" | "system",
    );
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];

    await (document as any).startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    }).ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing,
        pseudoElement,
      },
    );
  };

  return {
    ref,
    toggleThemeWithAnimation,
    theme,
    resolvedTheme,
    setTheme,
  };
};
