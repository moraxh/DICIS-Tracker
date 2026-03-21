"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export default function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsProps<T>) {
  return (
    <div
      className={`flex p-1 rounded-xl bg-zinc-100 dark:bg-white/5 w-fit ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider z-10
              ${
                isActive
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-white dark:bg-white/10 rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-white/10 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
