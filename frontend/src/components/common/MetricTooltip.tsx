"use client";

import { Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useRef, useState } from "react";

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
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const hideSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 500);
  };

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
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
            className={`pointer-events-none absolute left-1/2 z-[60] w-64 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-3 text-left text-[11px] font-normal normal-case leading-5 tracking-normal text-zinc-600 shadow-xl dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 ${
              placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
            }`}
          >
            <span className="mb-1 block font-semibold text-zinc-900 dark:text-white">
              {label}
            </span>
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
