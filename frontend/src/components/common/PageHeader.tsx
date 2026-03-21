"use client";

import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  countLabel?: string;
  className?: string;
}

export default function PageHeader({
  title,
  icon: Icon,
  count,
  countLabel = "resultados",
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
          {title}
        </h2>
      </div>

      {count !== undefined && (
        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
          {count} {countLabel}
        </span>
      )}
    </div>
  );
}
