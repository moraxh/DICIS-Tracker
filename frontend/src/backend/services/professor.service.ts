import type { Professor } from "@/backend/models/professor.model";
import { ClassRepository } from "@/backend/repositories/class.repository";
import { ProfessorRepository } from "@/backend/repositories/professor.repository";
import type {
  ClassWithDetails,
  ProfessorWithOccupancyInfo,
} from "@/backend/types";
import {
  getCurrentMinutes,
  getTodayOfWeek,
  isClassNow,
  minutesUntilTime,
  timeToMinutes,
} from "@/backend/utils";

export interface ProfessorsWithState {
  freeProfessors: ProfessorWithOccupancyInfo[];
  occupiedProfessors: ProfessorWithOccupancyInfo[];
}

export interface ProfessorWithSchedule {
  professor: Professor;
  classes: ClassWithDetails[];
}

export class ProfessorService {
  static getProfessorsWithState(): ProfessorsWithState {
    const todayDayOfWeek = getTodayOfWeek();
    const hydratedClasses = ClassRepository.getClassesByDay(todayDayOfWeek);

    const allProfessors = ProfessorRepository.getAllProfessors();

    const currentMinutes = getCurrentMinutes();
    const classesNow = hydratedClasses.filter((cls) =>
      isClassNow(cls, currentMinutes),
    );

    // Create a map for quick lookup of current classes by professor
    const currentClassesByProfessor = new Map<string, ClassWithDetails>();
    classesNow.forEach((cls) => {
      currentClassesByProfessor.set(cls.professor.id, cls);
    });

    // Enrich professors with occupancy information
    const enrichedProfessors = allProfessors.map((professor) => {
      const currentOccupancy =
        currentClassesByProfessor.get(professor.id) || null;
      const professorClasses = hydratedClasses
        .filter((cls) => cls.professor.id === professor.id)
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

      // Get next occupancy (next class after current time)
      const nextOccupancy =
        professorClasses.find((cls) => {
          const classStart = timeToMinutes(cls.start);
          return classStart > currentMinutes;
        }) || null;

      // Calculate time until occupation or freedom
      let timeUntilOccupancy: number | null = null;
      let timeUntilFree: number | null = null;
      let occupiedUntilEnd = false;

      if (currentOccupancy) {
        // Professor is occupied - calculate when they become free
        let actualEndClass = currentOccupancy;
        let keepChecking = true;

        while (keepChecking) {
          const nextConsecutiveClass = professorClasses.find(
            (cls) =>
              timeToMinutes(cls.start) === timeToMinutes(actualEndClass.end),
          );

          if (nextConsecutiveClass) {
            actualEndClass = nextConsecutiveClass;
          } else {
            keepChecking = false;
          }
        }

        timeUntilFree = minutesUntilTime(actualEndClass.end);

        // Check if the current block of classes ends at or after 6 PM (18:00)
        if (timeToMinutes(actualEndClass.end) >= timeToMinutes("18:00")) {
          occupiedUntilEnd = true;
        }
      } else if (nextOccupancy) {
        // Professor is free - calculate when they become occupied
        timeUntilOccupancy = minutesUntilTime(nextOccupancy.start);
      }

      return {
        professor,
        currentOccupancy,
        nextOccupancy,
        timeUntilOccupancy,
        timeUntilFree,
        occupiedUntilEnd,
      } as ProfessorWithOccupancyInfo;
    });

    const freeProfessors = enrichedProfessors.filter(
      (p) => !p.currentOccupancy,
    );
    const occupiedProfessors = enrichedProfessors.filter(
      (p) => p.currentOccupancy,
    );

    return {
      freeProfessors,
      occupiedProfessors,
    };
  }

  static getProfessorSchedule(
    professorId: string,
  ): ProfessorWithSchedule | null {
    const professorResult = ProfessorRepository.getProfessorById(professorId);
    if (!professorResult.success) {
      console.error(`Professor not found: ${professorId}`);
      return null;
    }

    const hydratedClasses = ClassRepository.getClassesByProfessor(professorId);

    return {
      professor: professorResult.data,
      classes: hydratedClasses,
    };
  }
}
