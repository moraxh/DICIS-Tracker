"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useThemeAnimation } from "@/hooks/useThemeAnimation";

export default function ThemeToggle() {
  const { ref, toggleThemeWithAnimation, theme } = useThemeAnimation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = () => {
    if (theme === "system") return <Monitor size={18} />;
    return theme === "dark" ? <Sun size={18} /> : <Moon size={18} />;
  };

  const handleToggle = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    try {
      await toggleThemeWithAnimation();
    } finally {
      setTimeout(() => setIsAnimating(false), 350);
    }
  };

  return (
    <button
      type="button"
      ref={ref}
      onClick={handleToggle}
      className="p-2.5 rounded-full bg-zinc-200/50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
      disabled={isAnimating}
    >
      <motion.span
        style={{ display: "flex" }}
        animate={{ rotate: isAnimating ? 270 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {mounted && getIcon()}
      </motion.span>
    </button>
  );
}
