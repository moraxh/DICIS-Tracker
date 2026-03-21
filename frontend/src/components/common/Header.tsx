"use client";

import { Clock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Badge from "./Badge";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    console.info(
      "%cWhat are you looking for? 👀\n%cThe code is open source anyway:\nhttps://github.com/moraxh",
      "color: #10b981; font-size: 20px; font-weight: bold; font-family: monospace;",
      "color: #a1a1aa; font-size: 14px; font-family: sans-serif;",
    );

    // Easter egg fake network request
    fetch("/api/v1/hidden-api-keys").catch(() => {});

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
            <Badge
              variant="neutral"
              icon={
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-2 h-2 rounded-full bg-red-500"
                />
              }
              className="text-zinc-500 dark:text-zinc-400"
            >
              En tiempo real
            </Badge>

            {isOutOfHours && (
              <Badge variant="info" icon={<Clock className="w-3.5 h-3.5" />}>
                Fuera de horario (Lun-Sáb 8AM-6PM)
              </Badge>
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
