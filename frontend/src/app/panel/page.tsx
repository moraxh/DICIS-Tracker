"use client";

import { 
  Heart, 
  BookOpen, 
  Users, 
  MapPin, 
  Calendar, 
  Bookmark,
  DoorOpen,
  User,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect } from "react";
import { useSubjects } from "@/context/Subject/useSubjects";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoritesData } from "@/hooks/useFavoritesData";
import { useMySubjects } from "@/hooks/useMySubjects";
import { useScheduleModal } from "@/hooks/useScheduleModal";
import GlowCard from "@/components/common/GlowCard";
import EmptyState from "@/components/common/EmptyState";
import Link from "next/link";
import CalendarView from "@/components/pages/panel/CalendarView";
import PageHeader from "@/components/common/PageHeader";
import RoomCard from "@/components/common/RoomCard";
import ProfessorCard from "@/components/common/ProfessorCard";
import SubjectCard from "@/components/common/SubjectCard";
import { useRooms } from "@/context/Rooms/useRooms";
import { useProfessors } from "@/context/Professor/useProfessors";
import { isOutsideSchoolHours } from "@/backend/utils";
import Tabs from "@/components/common/Tabs";
import LayoutSection from "@/components/common/LayoutSection";
import CardGrid from "@/components/common/CardGrid";
import BaseButton from "@/components/common/BaseButton";

export default function MiPanelPage() {
  const { subjects: allSubjects } = useSubjects();
  const { rooms: favRoomData, professors: favProfData } = useFavoritesData();
  const { roomsWithState } = useRooms();
  const { professorsWithState } = useProfessors();
  const { mySubjectIds, toggleSubject } = useMySubjects();
  const { openScheduleModal } = useScheduleModal();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [activeDataTab, setActiveDataTab] = useState<"subjects" | "professors" | "rooms">("subjects");
  const [activeFavTab, setActiveFavTab] = useState<"rooms" | "professors">("rooms");
  const [confirmSubject, setConfirmSubject] = useState<{ id: string, name: string } | null>(null);
  const [isOutsideHours, setIsOutsideHours] = useState(false);

  useEffect(() => {
    setIsOutsideHours(isOutsideSchoolHours());
  }, []);

  const mySubjects = useMemo(() => {
    return allSubjects.filter(s => mySubjectIds.has(s.subject.id));
  }, [allSubjects, mySubjectIds]);

  const myProfessors = useMemo(() => {
    const profs = new Map();
    mySubjects.forEach(s => {
      s.classes.forEach(c => {
        if (!profs.has(c.professor.id)) {
          profs.set(c.professor.id, c.professor);
        }
      });
    });
    return Array.from(profs.values());
  }, [mySubjects]);

  const myRooms = useMemo(() => {
    const rs = new Map();
    mySubjects.forEach(s => {
      s.classes.forEach(c => {
        if (!rs.has(c.room.id)) {
          rs.set(c.room.id, { ...c.room, type: "room" });
        }
      });
    });
    return Array.from(rs.values());
  }, [mySubjects]);

  const handleToggleSubject = (id: string, name: string) => {
    if (mySubjectIds.has(id)) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-12 pb-32 pt-8"
    >
      {/* Title Section */}
      <LayoutSection delay={0.1}>
        <PageHeader 
          title="Mi Panel" 
          icon={Heart} 
          className="pt-4"
        />
      </LayoutSection>

      {/* Calendar Section */}
      <LayoutSection delay={0.2}>
        <PageHeader 
          title="Mi Calendario" 
          icon={Calendar}
          className="border-none pb-0"
        />
        {mySubjects.length > 0 ? (
          <CalendarView 
            subjects={mySubjects} 
            onSubjectClick={(s) => openScheduleModal({ 
              id: s.subject.id, 
              name: s.subject.subject, 
              type: "subject", 
              subTitle: s.subject.course_name 
            })} 
          />
        ) : (
          <div className="p-12 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-white/5 text-center space-y-4 bg-zinc-50/50 dark:bg-white/[0.02]">
            <p className="text-sm text-zinc-500 uppercase font-bold tracking-tight">No has guardado materias para generar un calendario.</p>
            <BaseButton 
              variant="primary" 
              onClick={() => window.location.href = "/subjects"}
              className="inline-flex"
            >
              Explorar materias
            </BaseButton>
          </div>
        )}
      </LayoutSection>

      {/* Mis Datos Section (Tabbed) */}
      <LayoutSection delay={0.3}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
          <PageHeader 
            title="Mis Datos" 
            icon={Bookmark}
            className="border-none pb-0 w-full sm:w-auto"
          />
          
          <Tabs
            tabs={[
              { id: "subjects", label: "Materias", icon: BookOpen },
              { id: "professors", label: "Profesores", icon: Users },
              { id: "rooms", label: "Salones", icon: DoorOpen }
            ]}
            activeTab={activeDataTab}
            onChange={setActiveDataTab}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDataTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeDataTab === "subjects" ? (
              mySubjects.length > 0 ? (
                <CardGrid columns={3}>
                  {mySubjects.map((s) => (
                    <SubjectCard
                      key={s.subject.id}
                      subjectData={s}
                      isMySubject={mySubjectIds.has(s.subject.id)}
                      onToggleMySubject={(e) => { e.stopPropagation(); handleToggleSubject(s.subject.id, s.subject.subject); }}
                      onClick={() => openScheduleModal({ 
                        id: s.subject.id, 
                        name: s.subject.subject, 
                        type: "subject", 
                        subTitle: s.subject.course_name 
                      })}
                    />
                  ))}
                </CardGrid>
              ) : <EmptyState message="No has agregado materias aún." />
            ) : activeDataTab === "professors" ? (
              myProfessors.length > 0 ? (
                <CardGrid columns={4}>
                  {myProfessors.map(prof => {
                    const isFree = professorsWithState.freeProfessors.some(p => p.professor.id === prof.id);
                    const profState = isFree
                      ? professorsWithState.freeProfessors.find(p => p.professor.id === prof.id)
                      : professorsWithState.occupiedProfessors.find(p => p.professor.id === prof.id);

                    return (
                      <ProfessorCard
                        key={prof.id}
                        professor={prof}
                        status={isFree ? "available" : "occupied"}
                        isOutsideHours={isOutsideHours}
                        timeUntilFree={profState?.timeUntilFree}
                        timeUntilOccupancy={profState?.timeUntilOccupancy}
                        occupiedUntilEnd={profState?.occupiedUntilEnd}
                        currentOccupancy={profState?.currentOccupancy}
                        isFavorite={isFavorite(prof.id)}
                        onToggleFavorite={() => toggleFavorite(prof.id)}
                        onClick={() => openScheduleModal({ 
                          id: prof.id, 
                          name: prof.name, 
                          type: "professor",
                          location: profState?.currentOccupancy?.room.name
                        })}
                      />
                    );
                  })}
                </CardGrid>
              ) : <EmptyState message="No hay profesores asociados a tus materias." />
            ) : (
              myRooms.length > 0 ? (
                <CardGrid columns={4}>
                  {myRooms.map(room => {
                    const isFree = roomsWithState.freeRooms.some(r => r.room.id === room.id);
                    const roomState = isFree 
                      ? roomsWithState.freeRooms.find(r => r.room.id === room.id) 
                      : roomsWithState.occupiedRooms.find(r => r.room.id === room.id);
                    
                    return (
                      <RoomCard
                        key={room.id}
                        room={room}
                        status={isFree ? "available" : "occupied"}
                        isOutsideHours={isOutsideHours}
                        timeUntilFree={roomState?.timeUntilFree}
                        timeUntilOccupancy={roomState?.timeUntilOccupancy}
                        occupiedUntilEnd={roomState?.occupiedUntilEnd}
                        currentOccupancy={roomState?.currentOccupancy}
                        isFavorite={isFavorite(room.id)}
                        onToggleFavorite={() => toggleFavorite(room.id)}
                        onClick={() => openScheduleModal({ id: room.id, name: room.name, type: "room" })}
                      />
                    );
                  })}
                </CardGrid>
              ) : <EmptyState message="No hay salones asociados a tus materias." />
            )}
          </motion.div>
        </AnimatePresence>
      </LayoutSection>


      {/* Favoritos Section (Tabbed) */}
      <LayoutSection delay={0.4}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
          <PageHeader 
            title="Favoritos" 
            icon={Heart}
            className="border-none pb-0 w-full sm:w-auto"
          />
          
          <Tabs
            tabs={[
              { id: "rooms", label: "Salones", icon: DoorOpen },
              { id: "professors", label: "Profesores", icon: User }
            ]}
            activeTab={activeFavTab}
            onChange={setActiveFavTab}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFavTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {activeFavTab === "rooms" ? (
              favRoomData.length > 0 ? (
                <CardGrid columns={4}>
                  {favRoomData.map(room => {
                    const isFree = roomsWithState.freeRooms.some(r => r.room.id === room.id);
                    const roomState = isFree 
                      ? roomsWithState.freeRooms.find(r => r.room.id === room.id) 
                      : roomsWithState.occupiedRooms.find(r => r.room.id === room.id);
                    
                    return (
                      <RoomCard
                        key={room.id}
                        room={room}
                        status={isFree ? "available" : "occupied"}
                        isOutsideHours={isOutsideHours}
                        timeUntilFree={roomState?.timeUntilFree}
                        timeUntilOccupancy={roomState?.timeUntilOccupancy}
                        occupiedUntilEnd={roomState?.occupiedUntilEnd}
                        currentOccupancy={roomState?.currentOccupancy}
                        isFavorite={isFavorite(room.id)}
                        onToggleFavorite={() => toggleFavorite(room.id)}
                        onClick={() => openScheduleModal({ id: room.id, name: room.name, type: "room" })}
                      />
                    );
                  })}
                </CardGrid>
              ) : <EmptyState message="Sin salones favoritos." />
            ) : (
              favProfData.length > 0 ? (
                <CardGrid columns={4}>
                  {favProfData.map(prof => {
                    const isFree = professorsWithState.freeProfessors.some(p => p.professor.id === prof.id);
                    const profState = isFree
                      ? professorsWithState.freeProfessors.find(p => p.professor.id === prof.id)
                      : professorsWithState.occupiedProfessors.find(p => p.professor.id === prof.id);

                    return (
                      <ProfessorCard
                        key={prof.id}
                        professor={prof}
                        status={isFree ? "available" : "occupied"}
                        isOutsideHours={isOutsideHours}
                        timeUntilFree={profState?.timeUntilFree}
                        timeUntilOccupancy={profState?.timeUntilOccupancy}
                        occupiedUntilEnd={profState?.occupiedUntilEnd}
                        currentOccupancy={profState?.currentOccupancy}
                        isFavorite={isFavorite(prof.id)}
                        onToggleFavorite={() => toggleFavorite(prof.id)}
                        onClick={() => openScheduleModal({ 
                          id: prof.id, 
                          name: prof.name, 
                          type: "professor",
                          location: profState?.currentOccupancy?.room.name
                        })}
                      />
                    );
                  })}
                </CardGrid>
              ) : <EmptyState message="Sin profesores favoritos." />
            )}
          </motion.div>
        </AnimatePresence>
      </LayoutSection>

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
                className="relative w-full max-sm:max-w-xs max-w-sm bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-white/10 space-y-6"
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
    </motion.div>
  );
}
