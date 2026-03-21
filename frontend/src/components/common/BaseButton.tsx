"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface BaseButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "white";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
}

export default function BaseButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  disabled = false,
  type = "button",
  isLoading = false,
}: BaseButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider text-[10px]";

  const variants = {
    primary:
      "bg-zinc-900 text-white shadow-lg shadow-zinc-900/15 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100",
    secondary:
      "bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/10",
    ghost:
      "bg-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5",
    outline:
      "bg-transparent border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/5",
    danger: "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white",
    white: "bg-white text-zinc-900 shadow-lg hover:bg-zinc-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 rounded-lg",
    md: "px-6 py-2.5 rounded-xl",
    lg: "px-8 py-3.5 rounded-2xl text-xs",
    icon: "p-2 rounded-xl",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
          )}
          {children}
          {Icon && iconPosition === "right" && (
            <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
          )}
        </>
      )}
    </button>
  );
}
