"use client";

import { BookOpen, Search, Users, MapPin, Filter, X, Bookmark, BookmarkCheck, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useSubjects } from "@/context/Subject/useSubjects";
import { useScheduleModal } from "@/hooks/useScheduleModal";
import { useMySubjects } from "@/hooks/useMySubjects";
import SubjectCard from "@/components/common/SubjectCard";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import SearchBar from "@/components/common/SearchBar";
import FilterCheckbox from "@/components/common/FilterCheckbox";
import BaseButton from "@/components/common/BaseButton";
import LayoutSection from "@/components/common/LayoutSection";

export default function SubjectsPage() {
  const { subjects, isLoading } = useSubjects();
  const { openScheduleModal } = useScheduleModal();
  const { isMySubject, toggleSubject } = useMySubjects();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCarreras, setSelectedCarreras] = useState<string[]>([]);
  const [confirmSubject, setConfirmSubject] = useState<{ id: string, name: string } | null>(null);

  const setDebouncedSearchValue = useDebouncedCallback(
    (value: string) => setDebouncedSearch(value),
    { wait: 300 }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDebouncedSearchValue(value);
  };

  const carreras = useMemo(() => {
    const set = new Set(subjects.map((s) => s.subject.course_name));
    return Array.from(set).sort();
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch = 
        !debouncedSearch ||
        s.subject.subject.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.subject.course_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        s.classes.some(c => 
          c.professor.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          c.room.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

      const matchesCarrera = selectedCarreras.length === 0 || selectedCarreras.includes(s.subject.course_name);

      return matchesSearch && matchesCarrera;
    });
  }, [subjects, debouncedSearch, selectedCarreras]);

  const toggleCarrera = (carrera: string) => {
    setSelectedCarreras(prev => 
      prev.includes(carrera) 
        ? prev.filter(c => c !== carrera)
        : [...prev, carrera]
    );
  };

  const handleToggleSubject = (id: string, name: string) => {
    if (isMySubject(id)) {
      toggleSubject(id);
    } else {
      setConfirmSubject({ id, name });
    }
  };

  const confirmAdd = () => {
    if (confirmSubject) {
      toggleSubject(confirmSubject.id);
      setConfirmSubject(null);
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(filteredSubjects.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 5,
  });

  return (
    <LayoutSection className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="space-y-6 shrink-0 px-1">
        <PageHeader 
          title="Materias" 
          icon={BookOpen} 
          count={filteredSubjects.length} 
          countLabel="materias disponibles"
        />

        <div className="flex flex-col gap-5">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setDebouncedSearchValue(val);
            }}
            placeholder="Busca por nombre, carrera, profesor o salón..."
          />

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scroll-custom no-scrollbar">
            <BaseButton
              variant={selectedCarreras.length === 0 ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedCarreras([])}
            >
              Todas
            </BaseButton>
            
            <div className="h-4 w-px bg-zinc-200 dark:bg-white/10 mx-1 shrink-0" />

            {carreras.map((carrera) => (
              <FilterCheckbox
                key={carrera}
                label={carrera}
                checked={selectedCarreras.includes(carrera)}
                onChange={() => toggleCarrera(carrera)}
                className="shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto pr-2 scroll-custom"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-zinc-100 dark:bg-white/5 animate-pulse border border-zinc-200 dark:border-white/10" />
            ))}
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowItems = filteredSubjects.slice(startIndex, startIndex + columns);

              return (
                <div
                  key={virtualRow.key}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowItems.map((s) => {
                    return (
                      <div key={s.subject.id} className="h-[200px] py-1">
                        <SubjectCard
                          subjectData={s}
                          isMySubject={isMySubject(s.subject.id)}
                          onToggleMySubject={(e) => {
                            e.stopPropagation();
                            handleToggleSubject(s.subject.id, s.subject.subject);
                          }}
                          onClick={() => openScheduleModal({
                            id: s.subject.id,
                            name: s.subject.subject,
                            type: "subject",
                            subTitle: s.subject.course_name,
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState 
            message="No se encontraron materias que coincidan con tu búsqueda."
          />
        )}
      </div>

      <AnimatePresence>
        {confirmSubject && (
           <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmSubject(null)}
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
             />
             <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-white/10 space-y-6"
             >
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Agregar Materia</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                     ¿Estás seguro de que quieres agregar <span className="text-zinc-900 dark:text-white font-bold underline">{confirmSubject.name}</span> a tu panel?
                  </p>
                </div>
                <div className="flex gap-3">
                  <BaseButton
                    variant="outline"
                    onClick={() => setConfirmSubject(null)}
                    className="flex-1"
                  >
                    Cancelar
                  </BaseButton>
                  <BaseButton
                    variant="primary"
                    onClick={confirmAdd}
                    className="flex-1 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    Confirmar
                  </BaseButton>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </LayoutSection>
  );
}
