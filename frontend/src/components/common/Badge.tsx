"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  icon?: ReactNode;
  className?: string;
}

export default function Badge({ 
  children, 
  variant = "neutral", 
  icon,
  className = "" 
}: BadgeProps) {
  
  const variants = {
    success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    danger: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
    info: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20",
    neutral: "bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10"
  };

  return (
    <div className={`
      px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 shrink-0 whitespace-nowrap uppercase tracking-tight 
      ${variants[variant]} 
      ${className}
    `}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </div>
  );
}
