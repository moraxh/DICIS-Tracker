"use client";

import { useRef } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "@/context/ThemeProvider";

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
  setTheme: (theme: "light" | "dark" | "system") => void;
}

/**
 * Uses the native View Transition API when available. CSS transitions are
 * disabled by the provider while the theme class changes, avoiding a second
 * animation pass over every component.
 */
export const useThemeAnimation = (
  options?: UseThemeAnimationOptions,
): UseThemeAnimationReturn => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const duration = options?.duration ?? 260;
  const easing = options?.easing ?? "ease-out";

  const toggleThemeWithAnimation = async () => {
    const themeOrder: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themeOrder.indexOf(
      theme as "light" | "dark" | "system",
    );
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];

    const documentWithViewTransition = document as Document & {
      startViewTransition?: (callback: () => void) => {
        ready: Promise<void>;
      };
    };

    if (
      !ref.current ||
      !documentWithViewTransition.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y),
    );

    const transition = documentWithViewTransition.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });

    await transition.ready;

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
        pseudoElement: "::view-transition-new(root)",
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
