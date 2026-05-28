"use client";

import { BookOpen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SubjectWithDetails } from "@/backend/repositories/subject.repository";
import { getSearchScore } from "@/backend/utils";
import Dropdown from "@/components/common/Dropdown";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import SearchBar from "@/components/common/SearchBar";
import SubjectCard from "@/components/common/SubjectCard";

interface SubjectsData {
  subjects: SubjectWithDetails[];
  courses: { id: string; name: string }[];
}

export default function SubjectsPage() {
  const [data, setData] = useState<SubjectsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    fetch("/api/v1/subjects")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const courseOptions = useMemo(() => {
    if (!data) return [{ id: "all", label: "Todas las carreras" }];
    return [
      { id: "all", label: "Todas las carreras" },
      ...data.courses.map((c) => ({ id: c.id, label: c.name })),
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
            getSearchScore(searchQuery, s.professor),
            getSearchScore(searchQuery, s.roomName),
          ),
        }))
        .filter((s) => s._score > 0)
        .sort((a, b) => b._score - a._score || a.name.localeCompare(b.name));
    }

    return subjects.sort((a, b) => a.name.localeCompare(b.name));
  }, [data, selectedCourse, searchQuery]);

  return (
    <LayoutSection className="space-y-6 mt-6 pb-20">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Directorio de Materias"
          icon={BookOpen}
          count={filteredSubjects.length}
          countLabel="materias en total"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar materia, profesor o salón..."
            className="flex-1"
          />
          <Dropdown
            options={courseOptions}
            value={selectedCourse}
            onChange={setSelectedCourse}
            placeholder="Todas las carreras"
            className="sm:w-72"
          />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject, i) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              delay={Math.min(i * 0.03, 0.3)}
            />
          ))}
        </div>
      )}
    </LayoutSection>
  );
}
