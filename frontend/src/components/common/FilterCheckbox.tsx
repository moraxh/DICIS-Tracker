"use client";

import { Check } from "lucide-react";

interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function FilterCheckbox({ 
  label, 
  checked, 
  onChange, 
  className = "" 
}: FilterCheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        flex items-center gap-2 group transition-all
        ${className}
      `}
    >
      <div className={`
        w-4 h-4 rounded border flex items-center justify-center transition-all
        ${checked 
          ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" 
          : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 group-hover:border-zinc-300 dark:group-hover:border-white/20"
        }
      `}>
        {checked && <Check className="w-3 h-3" />}
      </div>
      <span className={`
        text-[10px] font-bold uppercase tracking-wider transition-colors
        ${checked ? "text-zinc-900 dark:text-white" : "text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"}
      `}>
        {label}
      </span>
    </button>
  );
}
