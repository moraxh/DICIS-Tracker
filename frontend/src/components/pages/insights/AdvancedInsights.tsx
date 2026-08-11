"use client";

import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  MapPinned,
  Store,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import MetricTooltip from "@/components/common/MetricTooltip";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";
import classesData from "@/data/classes.json";
import professorsData from "@/data/professors.json";
import roomsData from "@/data/rooms.json";

type ClassRecord = {
  day: string;
  start: string;
  end: string;
  subjectId: string;
  subjectName: string;
  courseName: string;
  professorId: string;
  roomId: string;
  roomName: string;
  headquarters?: string;
};

type NamedRecord = {
  id: string;
  name?: string;
  fullName?: string;
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
const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lun",
  TUESDAY: "Mar",
  WEDNESDAY: "Mié",
  THURSDAY: "Jue",
  FRIDAY: "Vie",
  SATURDAY: "Sáb",
};
const SLOTS = Array.from({ length: 21 }, (_, index) => 8 * 60 + index * 30);

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const formatTime = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

const formatRange = (value: number) =>
  `${formatTime(value)}–${formatTime(value + 30)}`;

const deduplicate = (items: ClassRecord[]) => {
  const unique = new Map<string, ClassRecord>();
  for (const item of items) {
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
};

const rankEntries = (values: Map<string, number>, limit = 5) =>
  Array.from(values, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, limit);

export default function AdvancedInsights() {
  const { selectedHeadquarters } = useHeadquarters();

  const classes = useMemo(
    () =>
      deduplicate(
        (classesData as ClassRecord[]).filter(
          (item) => item.headquarters === selectedHeadquarters,
        ),
      ),
    [selectedHeadquarters],
  );

  const rooms = (roomsData as NamedRecord[]).filter(
    (item) => item.headquarters === selectedHeadquarters,
  );
  const professors = (professorsData as NamedRecord[]).filter(
    (item) => item.headquarters === selectedHeadquarters,
  );
  const waves = useMemo(
    () =>
      SLOTS.map((slot) => {
        const starts = classes.filter(
          (item) => toMinutes(item.start) === slot,
        ).length;
        const ends = classes.filter(
          (item) => toMinutes(item.end) === slot,
        ).length;
        return { slot, starts, ends, flow: starts + ends };
      }),
    [classes],
  );

  const professorsBySlot = useMemo(
    () =>
      SLOTS.map((slot) => {
        const scheduledByDay = DAYS.map(
          (day) =>
            new Set(
              classes
                .filter(
                  (item) =>
                    item.day === day &&
                    toMinutes(item.start) <= slot &&
                    toMinutes(item.end) > slot,
                )
                .map((item) => item.professorId),
            ).size,
        );
        const scheduled = Math.round(
          scheduledByDay.reduce((sum, value) => sum + value, 0) /
            Math.max(scheduledByDay.length, 1),
        );
        return { slot, available: Math.max(professors.length - scheduled, 0) };
      }),
    [classes, professors.length],
  );

  const courseRanking = useMemo(() => {
    const values = new Map<string, number>();
    for (const item of classes)
      values.set(item.courseName, (values.get(item.courseName) ?? 0) + 1);
    return rankEntries(values, 5);
  }, [classes]);

  const subjectRanking = useMemo(() => {
    const values = new Map<string, number>();
    for (const item of classes)
      values.set(item.subjectName, (values.get(item.subjectName) ?? 0) + 1);
    return rankEntries(values, 5);
  }, [classes]);

  const zones = useMemo(() => {
    const values = new Map<string, number>();
    for (const room of rooms) {
      const match = room.name?.toUpperCase().match(/^(A|B|M|Y)\d/);
      const zone = match?.[1] ?? "Otros";
      const usage = classes
        .filter((item) => item.roomId === room.id)
        .reduce(
          (sum, item) =>
            sum + (toMinutes(item.end) - toMinutes(item.start)) / 60,
          0,
        );
      values.set(zone, (values.get(zone) ?? 0) + usage);
    }
    return rankEntries(values, 6);
  }, [classes, rooms]);

  const opportunity = useMemo(() => {
    const rows = DAYS.flatMap((day) =>
      SLOTS.map((slot) => {
        const starts = classes.filter(
          (item) => item.day === day && toMinutes(item.start) === slot,
        ).length;
        const ends = classes.filter(
          (item) => item.day === day && toMinutes(item.end) === slot,
        ).length;
        const activeRooms = new Set(
          classes
            .filter(
              (item) =>
                item.day === day &&
                toMinutes(item.start) <= slot &&
                toMinutes(item.end) > slot,
            )
            .map((item) => item.roomId),
        ).size;
        return { day, slot, starts, ends, flow: starts + ends, activeRooms };
      }),
    );
    const maxFlow = Math.max(...rows.map((row) => row.flow), 1);
    const maxOccupancy = Math.max(...rows.map((row) => row.activeRooms), 1);
    return rows
      .map((row) => ({
        ...row,
        score: Math.round(
          (row.flow / maxFlow) * 60 + (row.activeRooms / maxOccupancy) * 40,
        ),
      }))
      .filter((row) => row.flow > 0)
      .sort((a, b) => b.score - a.score || b.flow - a.flow)
      .slice(0, 5);
  }, [classes]);

  const maxWave = Math.max(...waves.map((wave) => wave.flow), 1);
  const maxAvailability = Math.max(
    ...professorsBySlot.map((item) => item.available),
    1,
  );
  const maxCourse = Math.max(...courseRanking.map((item) => item.value), 1);
  const maxSubject = Math.max(...subjectRanking.map((item) => item.value), 1);
  const maxZone = Math.max(...zones.map((item) => item.value), 1);

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                <CalendarClock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />{" "}
                Entradas y salidas
                <MetricTooltip label="Entradas y salidas">
                  Cada barra cuenta grupos que empiezan o terminan clase en ese
                  horario. No es un conteo de personas.
                </MetricTooltip>
              </h3>
              <p className="mt-1 text-[11px] text-zinc-400">
                Cada barra representa grupos que empiezan o terminan clase.
              </p>
            </div>
            <div className="flex gap-3 text-[10px] text-zinc-400">
              <span>
                <i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Salen
              </span>
              <span>
                <i className="mr-1 inline-block h-2 w-2 rounded-full bg-zinc-400" />
                Entran
              </span>
            </div>
          </div>
          <div className="flex h-36 items-end gap-1 border-b border-zinc-200 px-1 dark:border-white/10">
            {waves.map((wave, index) => (
              <div
                key={wave.slot}
                className="group relative flex h-full flex-1 items-end justify-center gap-px"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(wave.ends / maxWave) * 100}%` }}
                  transition={{ duration: 0.35, delay: index * 0.01 }}
                  title={`${formatTime(wave.slot)}: ${wave.ends} grupos salen`}
                  className="w-1/2 min-w-[2px] rounded-t bg-emerald-500/80"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(wave.starts / maxWave) * 100}%` }}
                  transition={{ duration: 0.35, delay: index * 0.01 }}
                  title={`${formatTime(wave.slot)}: ${wave.starts} grupos empiezan`}
                  className="w-1/2 min-w-[2px] rounded-t bg-zinc-300 dark:bg-white/25"
                />
                {index % 2 === 0 && (
                  <span className="absolute -bottom-5 text-[9px] text-zinc-400">
                    {formatTime(wave.slot)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-[10px] leading-4 text-zinc-400">
            Úsalo para detectar cambios de clase: cuando muchas barras suben al
            mismo tiempo suele haber más movimiento en pasillos.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />{" "}
              Profesores disponibles
              <MetricTooltip label="Profesores disponibles">
                Estimación del promedio de profesores que no tienen una clase
                activa en ese horario, usando los días con clases.
              </MetricTooltip>
            </h3>
            <p className="mt-1 text-[11px] text-zinc-400">
              Promedio de profesores sin clase en cada horario.
            </p>
          </div>
          <div className="space-y-2">
            {professorsBySlot
              .filter((_, index) => index % 2 === 0)
              .map((item) => (
                <div key={item.slot} className="flex items-center gap-3">
                  <span className="w-11 text-[10px] tabular-nums text-zinc-400">
                    {formatTime(item.slot)}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(item.available / maxAvailability) * 100}%`,
                      }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full bg-zinc-400 dark:bg-white/35"
                    />
                  </div>
                  <span className="w-8 text-right text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
                    {item.available}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-5 border-t border-zinc-200 pt-3 text-[10px] text-zinc-400 dark:border-white/10">
            {professors.length} profesores registrados en {selectedHeadquarters}
            .
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingPanel
          icon={GraduationCap}
          title="Actividad por carrera"
          description="Cantidad de sesiones programadas por carrera."
          help="Cuenta cuántas sesiones aparecen en el horario de cada carrera; no representa el número de estudiantes."
          rows={courseRanking}
          max={maxCourse}
          suffix="sesiones"
        />
        <RankingPanel
          icon={BookOpen}
          title="Materias con más sesiones"
          description="Las materias que aparecen más veces en el horario."
          help="Ordena las materias por número de sesiones programadas para identificar cuáles tienen más actividad."
          rows={subjectRanking}
          max={maxSubject}
          suffix="sesiones"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <Store className="h-4 w-4 text-emerald-500" /> Índice de
              oportunidad
              <MetricTooltip label="Índice de oportunidad">
                Combina movimiento de cambio de clase (60%) y ocupación de
                salones (40%). Es una prioridad relativa para comparar horarios,
                no una predicción exacta de personas.
              </MetricTooltip>
            </h3>
            <p className="mt-1 text-[11px] leading-4 text-zinc-400">
              Combina 60% de movimiento y 40% de ocupación. Es una prioridad
              relativa, no un número de personas.
            </p>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-white/10">
            {opportunity.map((row, index) => (
              <div
                key={`${row.day}-${row.slot}`}
                className="grid grid-cols-[24px_1fr_auto] items-center gap-3 py-2.5"
              >
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex justify-between gap-3 text-xs text-zinc-700 dark:text-zinc-200">
                    <span>
                      {DAY_LABELS[row.day]} · {formatRange(row.slot)}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {row.score}/100
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.score}%` }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
                <span className="text-right text-[10px] leading-4 text-zinc-400">
                  {row.ends} salen
                  <br />
                  {row.starts} entran
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <MapPinned className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />{" "}
              Mapa esquemático de zonas
              <MetricTooltip label="Mapa esquemático de zonas">
                Agrupa los salones por el prefijo de su nombre para orientar la
                actividad. No muestra posiciones físicas del campus.
              </MetricTooltip>
            </h3>
            <p className="mt-1 text-[11px] leading-4 text-zinc-400">
              Representación por edificio inferida del nombre del salón; no es
              un plano físico.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {zones.map((zone) => (
              <div
                key={zone.name}
                className="rounded-xl border border-zinc-200 p-3 dark:border-white/10"
                style={{ opacity: 0.55 + (zone.value / maxZone) * 0.45 }}
              >
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {zone.name === "Otros" ? "Otros" : `Edificio ${zone.name}`}
                </div>
                <div className="mt-2 text-xl font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                  {Math.round(zone.value)}h
                </div>
                <div className="mt-1 text-[10px] text-zinc-400">
                  clase programada
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RankingPanel({
  icon: Icon,
  title,
  description,
  help,
  rows,
  max,
  suffix,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
  help?: ReactNode;
  rows: { name: string; value: number }[];
  max: number;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" /> {title}
          <MetricTooltip label={title}>{help ?? description}</MetricTooltip>
        </h3>
        <p className="mt-1 text-[11px] text-zinc-400">{description}</p>
      </div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.name}
            className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3"
          >
            <span className="text-[10px] text-zinc-400">{index + 1}</span>
            <div className="min-w-0">
              <div className="truncate text-xs text-zinc-700 dark:text-zinc-300">
                {row.name}
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(row.value / max) * 100}%` }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="h-full rounded-full bg-zinc-400 dark:bg-white/35"
                />
              </div>
            </div>
            <span className="text-[10px] tabular-nums text-zinc-400">
              {row.value} {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
