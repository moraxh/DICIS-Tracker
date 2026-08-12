"use client";

import { Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MetricTooltipProps = {
  label: string;
  children: ReactNode;
  placement?: "top" | "bottom";
};

export default function MetricTooltip({
  label,
  children,
  placement = "bottom",
}: MetricTooltipProps) {
  const [open, setOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    left: number;
    top?: number;
    bottom?: number;
  } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const tooltipWidth = Math.min(256, window.innerWidth - 24);
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, 12 + tooltipWidth / 2),
      window.innerWidth - 12 - tooltipWidth / 2,
    );

    setTooltipPosition(
      placement === "bottom"
        ? { left, top: rect.bottom + 8 }
        : { left, bottom: window.innerHeight - rect.top + 8 },
    );
  }, [placement]);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updatePosition();
    setOpen(true);
  };

  const hideSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 500);
  };

  useEffect(() => {
    if (!open) return;

    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, updatePosition]);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        ref={buttonRef}
        aria-label={`Más información sobre ${label}`}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
        onClick={show}
        onFocus={show}
        onBlur={hideSoon}
        className="flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:bg-white/10 dark:hover:text-zinc-200"
      >
        <Info className="h-3 w-3" />
      </button>
      {tooltipPosition &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.span
                role="tooltip"
                initial={{
                  opacity: 0,
                  y: placement === "bottom" ? -4 : 4,
                  scale: 0.97,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: placement === "bottom" ? -4 : 4,
                  scale: 0.97,
                }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                style={tooltipPosition}
                className="pointer-events-none fixed z-[100] w-64 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-3 text-left text-[11px] font-normal normal-case leading-5 tracking-normal text-zinc-600 shadow-xl dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <span className="mb-1 block font-semibold text-zinc-900 dark:text-white">
                  {label}
                </span>
                {children}
              </motion.span>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </span>
  );
}
