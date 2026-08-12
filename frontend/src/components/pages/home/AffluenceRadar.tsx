"use client";

import {
  Activity,
  CalendarDays,
  ChevronDown,
  Clock3,
  DoorOpen,
  Info,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { getMexicoCityDate } from "@/backend/utils";
import MetricTooltip from "@/components/common/MetricTooltip";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";
import classesData from "@/data/classes.json";
import roomsData from "@/data/rooms.json";

type ClassRecord = {
  day: string;
  start: string;
  end: string;
  subjectId: string;
  roomId: string;
  headquarters?: string;
};

type Day = {
  id: string;
  short: string;
  name: string;
};

type RoomRecord = {
  id: string;
  headquarters?: string;
};

type RadarMode = "occupancy" | "opportunity";

type AffluenceRadarProps = {
  mode?: RadarMode;
};

const days: Day[] = [
  { id: "MONDAY", short: "Lun", name: "Lunes" },
  { id: "TUESDAY", short: "Mar", name: "Martes" },
  { id: "WEDNESDAY", short: "Mié", name: "Miércoles" },
  { id: "THURSDAY", short: "Jue", name: "Jueves" },
  { id: "FRIDAY", short: "Vie", name: "Viernes" },
  { id: "SATURDAY", short: "Sáb", name: "Sábado" },
];

const slots = Array.from({ length: 21 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  return {
    minutes,
    label: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
      minutes % 60,
    ).padStart(2, "0")}`,
  };
});

const dayNames = new Map(days.map((day) => [day.id, day.name]));

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatRange = (minutes: number) => {
  const end = minutes + 30;
  const format = (value: number) =>
    `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(
      value % 60,
    ).padStart(2, "0")}`;
  return `${format(minutes)}–${format(end)}`;
};

const getLevel = (value: number, max: number) => {
  if (value === 0) return 0;
  const ratio = value / Math.max(max, 1);
  if (ratio >= 0.82) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.35) return 2;
  return 1;
};

const levelStyles = [
  "bg-zinc-100 dark:bg-white/[0.025] border-zinc-200 dark:border-white/[0.06]",
  "bg-zinc-200/80 dark:bg-white/[0.07] border-zinc-300 dark:border-white/[0.1]",
  "bg-zinc-300/80 dark:bg-white/[0.14] border-zinc-400/70 dark:border-white/[0.16]",
  "bg-emerald-200/80 dark:bg-emerald-500/30 border-emerald-300 dark:border-emerald-400/40",
  "bg-emerald-400/90 dark:bg-emerald-500/70 border-emerald-500 dark:border-emerald-300/70",
];

export default function AffluenceRadar({
  mode = "opportunity",
}: AffluenceRadarProps) {
  const { selectedHeadquarters } = useHeadquarters();
  const [selectedKey, setSelectedKey] = useState("");
  const [showMethodology, setShowMethodology] = useState(false);
  const [now, setNow] = useState(() => getMexicoCityDate());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNextSlot = () => {
      const current = getMexicoCityDate();
      const secondsUntilNextSlot =
        (30 - (current.getMinutes() % 30)) * 60 - current.getSeconds();

      timeout = setTimeout(
        () => {
          setNow(getMexicoCityDate());
          scheduleNextSlot();
        },
        Math.max(secondsUntilNextSlot * 1000 + 100, 1000),
      );
    };

    scheduleNextSlot();
    return () => clearTimeout(timeout);
  }, []);

  const currentDay = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSlot = Math.floor(currentMinutes / 30) * 30;
  const currentKey = `${currentDay}-${currentSlot}`;
  const isCurrentVisible =
    days.some((day) => day.id === currentDay) &&
    slots.some((slot) => slot.minutes === currentSlot);

  const data = useMemo(() => {
    const unique = new Map<string, ClassRecord>();
    for (const item of classesData as ClassRecord[]) {
      if (item.headquarters !== selectedHeadquarters) continue;
      const key = [
        item.day,
        item.start,
        item.end,
        item.subjectId,
        item.roomId,
      ].join("|");
      unique.set(key, item);
    }
    return Array.from(unique.values());
  }, [selectedHeadquarters]);

  const totalRooms = useMemo(
    () =>
      new Set(
        (roomsData as RoomRecord[])
          .filter((room) => room.headquarters === selectedHeadquarters)
          .map((room) => room.id),
      ).size,
    [selectedHeadquarters],
  );

  const cells = useMemo(() => {
    const values = days.flatMap((day) =>
      slots.map((slot) => {
        const active = data.filter(
          (item) =>
            item.day === day.id &&
            toMinutes(item.start) <= slot.minutes &&
            toMinutes(item.end) > slot.minutes,
        );
        return {
          key: `${day.id}-${slot.minutes}`,
          day,
          slot,
          classes: active.length,
          rooms: new Set(active.map((item) => item.roomId)).size,
          outgoing: data.filter(
            (item) =>
              item.day === day.id && toMinutes(item.end) === slot.minutes,
          ).length,
          incoming: data.filter(
            (item) =>
              item.day === day.id && toMinutes(item.start) === slot.minutes,
          ).length,
        };
      }),
    );

    const max = Math.max(
      ...values.map((cell) =>
        mode === "occupancy" ? cell.classes : cell.outgoing,
      ),
      0,
    );
    return { values, max };
  }, [data, mode]);

  const bestCell = useMemo(
    () =>
      cells.values.reduce(
        (best, cell) =>
          (mode === "occupancy" ? cell.classes : cell.outgoing) >
          (mode === "occupancy" ? best.classes : best.outgoing)
            ? cell
            : best,
        cells.values[0],
      ),
    [cells.values, mode],
  );

  const activeCell =
    cells.values.find((cell) => cell.key === selectedKey) ?? bestCell;
  const selectedOccupancy = activeCell
    ? Math.round((activeCell.rooms / Math.max(totalRooms, 1)) * 100)
    : 0;
  const selectedFlow = activeCell
    ? activeCell.outgoing + activeCell.incoming
    : 0;
  const topWindows = useMemo(
    () =>
      [...cells.values]
        .filter((cell) =>
          mode === "occupancy"
            ? cell.rooms > 0
            : cell.outgoing + cell.incoming > 0,
        )
        .sort((a, b) => {
          const aValue =
            mode === "occupancy" ? a.rooms : a.outgoing + a.incoming;
          const bValue =
            mode === "occupancy" ? b.rooms : b.outgoing + b.incoming;
          return bValue - aValue || b.outgoing - a.outgoing;
        })
        .slice(0, 5),
    [cells.values, mode],
  );
  const dailySummary = useMemo(
    () =>
      days.map((day) => {
        const dayCells = cells.values.filter((cell) => cell.day.id === day.id);
        const peak = dayCells.reduce(
          (best, cell) =>
            (mode === "occupancy" ? cell.classes : cell.outgoing) >
            (mode === "occupancy" ? best.classes : best.outgoing)
              ? cell
              : best,
          dayCells[0],
        );
        return {
          day,
          peak,
          value: peak
            ? mode === "occupancy"
              ? peak.classes
              : peak.outgoing
            : 0,
        };
      }),
    [cells.values, mode],
  );
  const bestDay = dayNames.get(bestCell?.day.id ?? "") ?? "esta semana";
  const bestLabel = bestCell
    ? `${bestDay}, ${formatRange(bestCell.slot.minutes)}`
    : "Sin datos";

  const weeklyAverage = data.length
    ? Math.round(
        data.length /
          Math.max(
            days.filter((day) => data.some((item) => item.day === day.id))
              .length,
            1,
          ),
      )
    : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-7"
    >
      <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-emerald-400/[0.035] blur-3xl dark:bg-emerald-400/[0.05]" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                {mode === "occupancy"
                  ? "Radar de ocupación"
                  : "Radar de oportunidades"}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              {mode === "occupancy"
                ? "Mira cuándo se llena el campus"
                : "Vende cuando termina la clase"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {mode === "occupancy"
                ? "Consulta las horas con más clases simultáneas y salones ocupados."
                : "Visualiza las ventanas en las que salen más grupos de clase. Es una aproximación del flujo disponible para cafetería, comida y ventas."}
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            {selectedHeadquarters || "Cargando sede"}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_270px]">
          <div className="min-w-0 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-white/[0.08] dark:bg-white/[0.025] sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Semana típica
                  <MetricTooltip label="Semana típica">
                    Resume los horarios publicados para una semana normal. No
                    incluye cancelaciones, días festivos ni asistencia real.
                  </MetricTooltip>
                </span>
                {isCurrentVisible && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Ahora {formatRange(currentSlot)}
                  </span>
                )}
              </div>
              <div className="hidden items-center gap-2 text-[10px] font-medium text-zinc-400 sm:flex">
                <span>Baja</span>
                <span className="h-2 w-2 rounded-sm bg-zinc-200 dark:bg-white/10" />
                <span className="h-2 w-2 rounded-sm bg-zinc-400 dark:bg-white/20" />
                <span className="h-2 w-2 rounded-sm bg-emerald-300 dark:bg-emerald-500/40" />
                <span className="h-2 w-2 rounded-sm bg-emerald-500 dark:bg-emerald-400/80" />
                <span>Pico</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="mx-auto min-w-[680px] max-w-[760px]">
                <div className="grid grid-cols-[52px_repeat(21,minmax(22px,1fr))] gap-1 px-1">
                  <div />
                  {slots.map((slot, index) => (
                    <div
                      key={slot.label}
                      className="h-5 text-center text-[9px] font-medium text-zinc-400"
                    >
                      {index % 2 === 0 ? slot.label : ""}
                    </div>
                  ))}
                  {days.map((day) => (
                    <div key={day.id} className="contents">
                      <div className="flex h-7 items-center text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        {day.short}
                      </div>
                      {slots.map((slot) => {
                        const cell = cells.values.find(
                          (item) =>
                            item.key === [day.id, slot.minutes].join("-"),
                        );
                        if (!cell) return null;
                        const level = getLevel(
                          mode === "occupancy" ? cell.classes : cell.outgoing,
                          cells.max,
                        );
                        const selected = activeCell?.key === cell.key;
                        const current = currentKey === cell.key;
                        return (
                          <button
                            type="button"
                            key={cell.key}
                            title={
                              mode === "occupancy"
                                ? `${day.name}, ${formatRange(slot.minutes)}: ${cell.classes} clases, ${cell.rooms} salones ocupados`
                                : `${day.name}, ${formatRange(slot.minutes)}: ${cell.outgoing} grupos salen, ${cell.incoming} empiezan`
                            }
                            onClick={() => setSelectedKey(cell.key)}
                            className={[
                              "relative h-7 rounded-md border transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:shadow-md",
                              levelStyles[level],
                              selected
                                ? "z-10 ring-2 ring-emerald-500 ring-offset-1 ring-offset-zinc-50 dark:ring-offset-zinc-950"
                                : "",
                              current
                                ? "after:absolute after:inset-1 after:rounded-sm after:border after:border-white after:content-[''] dark:after:border-emerald-100"
                                : "",
                            ].join(" ")}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    Resumen por día
                    <MetricTooltip label="Pico del día">
                      Es el bloque de 30 minutos con el valor más alto de ese
                      día. La barra permite comparar los días rápidamente.
                    </MetricTooltip>
                  </span>
                </span>
                <span className="text-[10px] font-medium text-zinc-400">
                  Pico del día
                </span>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {dailySummary.map(({ day, peak, value }) => (
                  <div key={day.id} className="flex items-center gap-2.5">
                    <span className="w-7 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                      {day.short}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-emerald-500/80 transition-all"
                        style={{
                          width: `${Math.max((value / Math.max(cells.max, 1)) * 100, value ? 4 : 0)}%`,
                        }}
                      />
                    </div>
                    <span className="w-7 text-right text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {value}
                    </span>
                    <span className="hidden w-20 text-right text-[10px] text-zinc-400 sm:block">
                      {peak ? formatRange(peak.slot.minutes) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-zinc-950 p-5 text-white dark:bg-white/[0.06]">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    {mode === "occupancy"
                      ? "Mayor ocupación"
                      : "Mayor salida estimada"}
                    <MetricTooltip
                      label={
                        mode === "occupancy"
                          ? "Mayor ocupación"
                          : "Mayor salida estimada"
                      }
                    >
                      {mode === "occupancy"
                        ? "Es el momento con más clases funcionando al mismo tiempo. No significa que todos los alumnos hayan asistido."
                        : "Es el momento en que más grupos terminan clase, una señal de posible movimiento hacia pasillos y cafeterías."}
                    </MetricTooltip>
                  </span>
                </span>
                <Sparkles className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="text-2xl font-bold tracking-tight text-emerald-300">
                {mode === "occupancy"
                  ? `${bestCell?.classes ?? 0} clases activas`
                  : `${bestCell?.outgoing ?? 0} grupos salen`}
              </div>
              <div className="mt-1 text-sm font-medium text-white">
                {bestLabel}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                <UsersRound className="h-3.5 w-3.5" />
                {mode === "occupancy"
                  ? `${bestCell?.rooms ?? 0} salones ocupados`
                  : `${bestCell?.incoming ?? 0} grupos empiezan en ese bloque`}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <Clock3 className="h-4 w-4" /> Momento seleccionado
                <MetricTooltip label="Momento seleccionado">
                  Son los datos del cuadro que elegiste en el mapa o de la
                  ventana que seleccionaste en la lista inferior.
                </MetricTooltip>
              </div>
              {activeCell && (
                <>
                  <div className="text-lg font-bold text-zinc-900 dark:text-white">
                    {activeCell.day.name},{" "}
                    {formatRange(activeCell.slot.minutes)}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.05]">
                      <div className="text-xl font-bold text-zinc-900 dark:text-white">
                        {mode === "occupancy"
                          ? activeCell.classes
                          : activeCell.outgoing}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                        {mode === "occupancy"
                          ? "Clases activas"
                          : "Grupos que salen"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.05]">
                      <div className="text-xl font-bold text-zinc-900 dark:text-white">
                        {mode === "occupancy"
                          ? activeCell.rooms
                          : activeCell.incoming}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                        {mode === "occupancy"
                          ? "Salones ocupados"
                          : "Grupos que empiezan"}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {mode === "occupancy"
                      ? activeCell.classes >= cells.max * 0.8
                        ? "Alta ocupación: muchas clases están activas en este momento."
                        : "Ocupación moderada en este bloque horario."
                      : activeCell.outgoing >= cells.max * 0.8
                        ? "Ventana fuerte: muchas clases terminan aquí. Buen momento para vender."
                        : "Ventana moderada: puede funcionar dependiendo de tu producto."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
          <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-emerald-400/[0.09] blur-3xl dark:bg-emerald-400/[0.08]" />
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-400/[0.08] blur-3xl dark:bg-cyan-400/[0.07]" />

          <div className="relative z-10 grid border-b border-zinc-200 dark:border-white/10 sm:grid-cols-2">
            <div className="flex items-end justify-between gap-4 px-5 py-4 sm:border-r sm:border-zinc-200 sm:dark:border-white/10">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Ocupación programada
                  <MetricTooltip label="Ocupación programada">
                    Si aparecen 35 de 50 salones, el resultado es 70%. Describe
                    el horario planeado, no cuánta gente asistió realmente.
                  </MetricTooltip>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {activeCell?.rooms ?? 0} de {totalRooms} salones
                </p>
              </div>
              <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                {selectedOccupancy}%
              </span>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-zinc-200 px-5 py-4 dark:border-white/10 sm:border-t-0">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Flujo de transición
                  <MetricTooltip label="Flujo de transición">
                    Suma los grupos que salen y los que entran. Por ejemplo, 20
                    que salen + 15 que empiezan equivale a 35 movimientos.
                  </MetricTooltip>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {activeCell?.outgoing ?? 0} salen ·{" "}
                  {activeCell?.incoming ?? 0} empiezan
                </p>
              </div>
              <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
                {selectedFlow}
              </span>
            </div>
          </div>

          <div className="relative z-10 px-5 py-4">
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                Ventanas destacadas
                <MetricTooltip label="Ventanas destacadas">
                  Ordena los cinco bloques más intensos de la semana. Puedes
                  tocar cualquiera para ver su detalle en la parte superior.
                </MetricTooltip>
              </h3>
              <span className="text-[10px] text-zinc-400">
                {mode === "occupancy" ? "Ocupación" : "Movimiento"}
              </span>
            </div>

            <div className="divide-y divide-zinc-200/80 dark:divide-white/[0.07]">
              {topWindows.map((cell, index) => {
                const value =
                  mode === "occupancy"
                    ? cell.rooms
                    : cell.outgoing + cell.incoming;
                const percentage = Math.round(
                  (cell.rooms / Math.max(totalRooms, 1)) * 100,
                );
                return (
                  <button
                    type="button"
                    key={cell.key}
                    onClick={() => setSelectedKey(cell.key)}
                    className="grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 py-2.5 text-left transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    <span className="text-[10px] tabular-nums text-zinc-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {cell.day.name} · {formatRange(cell.slot.minutes)}
                    </span>
                    <span className="text-right text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
                      {mode === "occupancy"
                        ? `${percentage}% · ${cell.rooms} salones`
                        : `${value} · ${cell.outgoing} salen / ${cell.incoming} entran`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-xs text-zinc-400 dark:border-white/10">
          <span>{data.length} registros de horario analizados</span>
          <span className="flex items-center gap-3">
            <span>Promedio: {weeklyAverage} registros por día activo</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              <ShieldCheck className="h-3 w-3" /> Confianza referencial
              <MetricTooltip label="Confianza referencial" placement="top">
                Los cálculos usan horarios oficiales, pero no tenemos matrícula
                por grupo, cancelaciones ni conteos de asistencia. Sirve para
                comparar patrones, no para predecir personas exactas.
              </MetricTooltip>
            </span>
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50/60 dark:border-white/[0.08] dark:bg-white/[0.025]">
          <button
            type="button"
            onClick={() => setShowMethodology((value) => !value)}
            aria-expanded={showMethodology}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-100/70 dark:hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Info className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  ¿Cómo se calcula?
                </span>
                <span className="mt-0.5 block text-[10px] text-zinc-400">
                  Conoce qué significa cada indicador
                </span>
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${showMethodology ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showMethodology && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid border-t border-zinc-200/80 dark:border-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-zinc-200/80 sm:dark:divide-white/[0.08]">
                  <div className="px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <DoorOpen className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        Ocupación
                      </span>
                    </div>
                    <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
                      Una clase cuenta mientras está activa. El porcentaje
                      divide salones ocupados únicos entre todos los salones de
                      la sede.
                    </p>
                  </div>

                  <div className="border-t border-zinc-200/80 px-4 py-3 dark:border-white/[0.08] sm:border-t-0">
                    <div className="mb-2 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <LogOut className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        Oportunidad
                      </span>
                    </div>
                    <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
                      El flujo suma grupos que terminan y grupos que empiezan en
                      cada bloque de 30 minutos; ambos valores permanecen
                      visibles.
                    </p>
                  </div>

                  <div className="border-t border-zinc-200/80 px-4 py-3 dark:border-white/[0.08] sm:border-t-0">
                    <div className="mb-2 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        Precisión
                      </span>
                    </div>
                    <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
                      Es una estimación por horarios y grupos, no un conteo de
                      personas ni de asistencia real.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
