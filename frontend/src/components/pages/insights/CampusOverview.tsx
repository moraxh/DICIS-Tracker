"use client";

import { Activity, Building2, Map as MapIcon, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import MetricTooltip from "@/components/common/MetricTooltip";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";
import classesData from "@/data/classes.json";
import roomsData from "@/data/rooms.json";

type ClassRecord = {
  day: string;
  start: string;
  end: string;
  roomId: string;
  headquarters?: string;
};

type RoomRecord = {
  id: string;
  name: string;
  headquarters?: string;
};

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
const CAMPUSES = ["Salamanca", "Yuriria"];
const SLOTS = Array.from({ length: 21 }, (_, index) => 8 * 60 + index * 30);

const minutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const timeLabel = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

const zoneOf = (name: string) => {
  const normalized = name.trim().toUpperCase();
  const match = normalized.match(/^(A|B|M|Y)\d/);
  return match?.[1] ?? "Otros";
};

export default function CampusOverview() {
  const { selectedHeadquarters } = useHeadquarters();

  const classes = classesData as ClassRecord[];
  const rooms = roomsData as RoomRecord[];

  const campusStats = useMemo(
    () =>
      CAMPUSES.map((headquarters) => {
        const campusClasses = classes.filter(
          (item) => item.headquarters === headquarters,
        );
        const campusRooms = new Set(
          rooms
            .filter((room) => room.headquarters === headquarters)
            .map((room) => room.id),
        );
        const cells = DAYS.flatMap((day) =>
          SLOTS.map((slot) => {
            const occupied = new Set(
              campusClasses
                .filter(
                  (item) =>
                    item.day === day &&
                    minutes(item.start) <= slot &&
                    minutes(item.end) > slot,
                )
                .map((item) => item.roomId),
            );
            return { day, slot, occupied: occupied.size };
          }),
        );
        const peak = cells.reduce(
          (best, cell) => (cell.occupied > best.occupied ? cell : best),
          cells[0],
        );
        const average = Math.round(
          cells.reduce((sum, cell) => sum + cell.occupied, 0) /
            Math.max(cells.length, 1),
        );

        return {
          headquarters,
          rooms: campusRooms.size,
          classes: campusClasses.length,
          peak,
          average,
          percentage: Math.round(
            (peak.occupied / Math.max(campusRooms.size, 1)) * 100,
          ),
        };
      }),
    [classes, rooms],
  );

  const selectedSeries = useMemo(() => {
    const campusClasses = classes.filter(
      (item) => item.headquarters === selectedHeadquarters,
    );
    const activeDays = DAYS.filter((day) =>
      campusClasses.some((item) => item.day === day),
    );

    return SLOTS.map((slot) => {
      const total = activeDays.reduce((sum, day) => {
        return (
          sum +
          new Set(
            campusClasses
              .filter(
                (item) =>
                  item.day === day &&
                  minutes(item.start) <= slot &&
                  minutes(item.end) > slot,
              )
              .map((item) => item.roomId),
          ).size
        );
      }, 0);
      return activeDays.length ? total / activeDays.length : 0;
    });
  }, [classes, selectedHeadquarters]);

  const chart = useMemo(() => {
    const max = Math.max(...selectedSeries, 1);
    const points = selectedSeries
      .map((value, index) => {
        const x = 10 + (index / Math.max(selectedSeries.length - 1, 1)) * 580;
        const y = 132 - (value / max) * 104;
        return `${x},${y}`;
      })
      .join(" ");
    return { max, points };
  }, [selectedSeries]);

  const zones = useMemo(() => {
    const roomZone = new Map(
      rooms
        .filter((room) => room.headquarters === selectedHeadquarters)
        .map((room) => [room.id, zoneOf(room.name)]),
    );
    const values = new Map<string, number>();

    for (const item of classes) {
      if (item.headquarters !== selectedHeadquarters) continue;
      const zone = roomZone.get(item.roomId) ?? "Otros";
      const hours = (minutes(item.end) - minutes(item.start)) / 60;
      values.set(zone, (values.get(zone) ?? 0) + hours);
    }

    return Array.from(values, ([zone, hours]) => ({ zone, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [classes, rooms, selectedHeadquarters]);

  const maxZoneHours = Math.max(...zones.map((zone) => zone.hours), 1);

  return (
    <section className="space-y-4">
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                <Activity className="h-4 w-4 text-emerald-500" /> Ritmo del
                campus
                <MetricTooltip label="Ritmo del campus">
                  Promedio de salones ocupados en cada horario entre los días
                  con clases. Te ayuda a ver cuándo sube o baja la actividad.
                </MetricTooltip>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Promedio de salones ocupados por hora · {selectedHeadquarters}
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="min-w-0 overflow-hidden">
            <svg
              viewBox="0 0 600 160"
              role="img"
              aria-label="Ritmo promedio de ocupación durante el día"
              className="h-44 w-full"
            >
              {[28, 80, 132].map((y) => (
                <line
                  key={y}
                  x1="10"
                  x2="590"
                  y1={y}
                  y2={y}
                  className="stroke-zinc-200 dark:stroke-white/10"
                  strokeDasharray="3 5"
                />
              ))}
              <polyline
                points={chart.points}
                fill="none"
                className="stroke-emerald-500"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {selectedSeries.map((_value, index) => {
                const x =
                  10 + (index / Math.max(selectedSeries.length - 1, 1)) * 580;
                return index % 2 === 0 ? (
                  <text
                    key={SLOTS[index]}
                    x={x}
                    y="153"
                    textAnchor="middle"
                    className="fill-zinc-400 text-[9px]"
                  >
                    {timeLabel(SLOTS[index])}
                  </text>
                ) : null;
              })}
              <circle
                cx={
                  10 +
                  (selectedSeries.indexOf(Math.max(...selectedSeries)) /
                    Math.max(selectedSeries.length - 1, 1)) *
                    580
                }
                cy={132 - (Math.max(...selectedSeries) / chart.max) * 104}
                r="4"
                className="fill-emerald-500 stroke-white dark:stroke-zinc-950"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                <Building2 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />{" "}
                Comparativa de sedes
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Cada sede se compara contra sus propios salones.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-white/10">
            {campusStats.map((campus) => (
              <div
                key={campus.headquarters}
                className="py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {campus.headquarters}
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
                    {campus.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${campus.percentage}%` }}
                    transition={{ duration: 0.45 }}
                    className="h-full rounded-full bg-zinc-400 dark:bg-white/35"
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-zinc-400">
                  <span>Pico: {campus.peak.occupied} salones</span>
                  <span>{campus.rooms} salones totales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              <MapIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />{" "}
              Actividad por zona
              <MetricTooltip label="Actividad por zona">
                Agrupa las horas programadas según el prefijo del nombre del
                salón. Es una guía de actividad, no un plano físico.
              </MetricTooltip>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Horas de clase programadas por edificio o prefijo de salón ·{" "}
              {selectedHeadquarters}
            </p>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {zones.map((zone) => (
            <div key={zone.zone} className="flex items-center gap-3">
              <span className="w-12 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {zone.zone === "Otros" ? "Otros" : `Edificio ${zone.zone}`}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(zone.hours / maxZoneHours) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-zinc-400 dark:bg-white/35"
                />
              </div>
              <span className="w-16 text-right text-[10px] tabular-nums text-zinc-400">
                {Math.round(zone.hours)} h
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
