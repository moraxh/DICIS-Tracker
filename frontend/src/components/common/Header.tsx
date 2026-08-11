"use client";

import { Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";
import Dropdown from "./Dropdown";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const {
    availableHeadquarters,
    selectedHeadquarters,
    setSelectedHeadquarters,
  } = useHeadquarters();

  useEffect(() => {
    console.info(
      "%cWhat are you looking for? 👀\n%cThe code is open source anyway:\nhttps://github.com/moraxh",
      "color: #10b981; font-size: 20px; font-weight: bold; font-family: monospace;",
      "color: #a1a1aa; font-size: 14px; font-family: sans-serif;",
    );

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
    <header className="max-w-6xl mx-auto px-6 pt-7 sm:pt-9 pb-7 sm:pb-9 w-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col gap-7"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              DICIS · Consulta rápida
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              DICIS Tracker
            </h1>
            <p className="mt-2 text-sm sm:text-base leading-6 text-zinc-600 dark:text-zinc-400 max-w-lg text-balance">
              Consulta salones libres y profesores disponibles en tu sede.
            </p>
          </div>
          <div className="flex items-center gap-4 sm:pt-1">
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-medium tabular-nums text-zinc-900 dark:text-white tracking-tight">
                {currentTime
                  ? currentTime.toLocaleTimeString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </div>
              <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium capitalize">
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
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
            <div className="w-full sm:w-[280px]">
              <label
                htmlFor="headquarters-selector"
                className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400"
              >
                Sede
              </label>
              <Dropdown
                id="headquarters-selector"
                options={availableHeadquarters.map((headquarters) => ({
                  id: headquarters,
                  label: headquarters,
                }))}
                value={selectedHeadquarters}
                onChange={setSelectedHeadquarters}
                placeholder="Seleccionar sede"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 sm:pb-3">
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>Sede activa: {selectedHeadquarters}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-200/80 dark:border-white/10 pt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-2 w-2 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Datos en tiempo real
            </span>
            <span>Resultados filtrados por sede</span>
            {isOutOfHours && (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                Fuera de horario · Lun-Sáb, 8:00–18:00
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
}
