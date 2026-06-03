"use client";

import { BookOpen, Building2, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SubjectWithDetails } from "@/backend/repositories/subject.repository";
import { getSearchScore } from "@/backend/utils";
import Dropdown from "@/components/common/Dropdown";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import SearchBar from "@/components/common/SearchBar";
import SubjectCard from "@/components/common/SubjectCard";
import { useHeadquarters } from "@/context/Headquarters/useHeadquarters";

interface SubjectsData {
  subjects: SubjectWithDetails[];
  courses: { id: string; name: string; label: string; headquarters: string }[];
}

export default function SubjectsPage() {
  const { selectedHeadquarters } = useHeadquarters();
  const [data, setData] = useState<SubjectsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    setIsLoading(true);
    fetch(
      `/api/v1/subjects?headquarters=${encodeURIComponent(selectedHeadquarters)}`,
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedHeadquarters]);

  const courseOptions = useMemo(() => {
    if (!data) return [{ id: "all", label: "Todas las carreras" }];
    return [
      { id: "all", label: "Todas las carreras" },
      ...data.courses.map((c) => ({ id: c.id, label: c.label })),
    ];
  }, [data]);

  const filteredSubjects = useMemo(() => {
    if (!data) return [];

    let subjects = data.subjects;

    if (selectedCourse !== "all") {
      subjects = subjects.filter((s) => s.courseId === selectedCourse);
    }

    if (searchQuery) {
      return subjects
        .map((s) => ({
          ...s,
          _score: Math.max(
            getSearchScore(searchQuery, s.name),
            getSearchScore(searchQuery, s.courseName),
            getSearchScore(searchQuery, s.professor),
            getSearchScore(searchQuery, s.roomName),
            getSearchScore(searchQuery, s.headquarters),
          ),
        }))
        .filter((s) => s._score > 0)
        .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name));
    }

    return subjects.sort((a, b) => a.name.localeCompare(b.name));
  }, [data, searchQuery, selectedCourse]);

  return (
    <LayoutSection className="space-y-6 mt-6 pb-20">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Directorio de Materias"
          icon={BookOpen}
          count={filteredSubjects.length}
          countLabel="materias en total"
        />
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar materia, profesor, sede o salón..."
            className="flex-1"
          />
          <Dropdown
            options={courseOptions}
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="Todas las carreras"
            className="xl:w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2">
            <MapPin className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              {selectedHeadquarters}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2">
            <Building2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              {selectedCourse === "all"
                ? "Todas las carreras"
                : courseOptions.find((option) => option.id === selectedCourse)
                    ?.label}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }, (_, i) => `subject-skeleton-${i}`).map(
            (key) => (
              <div
                key={key}
                className="w-full h-[148px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
              />
            ),
          )}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <EmptyState message="No se encontraron materias con los filtros seleccionados." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
                  {selectedHeadquarters}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filteredSubjects.length} materias visibles en la sede activa
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {
                Array.from(
                  new Set(filteredSubjects.map((subject) => subject.courseId)),
                ).length
              }{" "}
              carreras
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                delay={Math.min(i * 0.03, 0.3)}
              />
            ))}
          </div>
        </div>
      )}
    </LayoutSection>
  );
}
