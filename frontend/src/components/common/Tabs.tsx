"use client";

import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string | any) => void;
  className?: string;
  variant?: "pills" | "underline";
}

export default function Tabs({ 
  tabs, 
  activeTab, 
  onChange, 
  className = "",
  variant = "pills"
}: TabsProps) {
  
  return (
    <div className={`flex p-1 rounded-xl bg-zinc-100 dark:bg-white/5 w-fit ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider z-10
              ${isActive 
                ? "text-red-500" 
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
