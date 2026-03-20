"use client";

import { Clock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const outOfHours = () => {
    if (!currentTime) return false;
    const day = currentTime.getDay();
    const hours = currentTime.getHours();

    if (day === 0) return true;
    if (hours < 8 || hours >= 18) return true;

    return false;
  };

  const isOutOfHours = outOfHours();

  return (
    <header className="max-w-6xl mx-auto px-6 pt-8 pb-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="flex-1">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">
            DICIS Tracker
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mb-4 text-balance">
            Esta herramienta te ayuda a encontrar salones vacíos o saber si un
            profesor está disponible.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-sm font-medium">En tiempo real</span>
            </div>

            {isOutOfHours && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-500/30"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Fuera de horario (Lun-Sáb 8AM-6PM)</span>
              </motion.div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 sm:self-end self-start">
          <div className="text-right hidden md:block">
            <div className="text-2xl font-medium text-zinc-900 dark:text-white tracking-tight">
              {currentTime
                ? currentTime.toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {currentTime
                ? currentTime.toLocaleDateString("es-MX", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Cargando..."}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </motion.div>
    </header>
  );
}
