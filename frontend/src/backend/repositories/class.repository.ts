import { db } from "@/backend/db";
import type { Class } from "@/backend/models/class.model";
import { Professor } from "@/backend/models/professor.model";
import { Room } from "@/backend/models/room.model";
import { Subject } from "@/backend/models/subject.model";
import type { ClassWithDetails, DaysOfWeek, Result } from "@/backend/types";
import { ProfessorRepository } from "./professor.repository";
import { RoomRepository } from "./room.repository";
import { SubjectRepository } from "./subject.repository";

interface LookupMaps {
  subjects: Record<string, Subject>;
  professors: Record<string, Professor>;
  rooms: Record<string, Room>;
}

export class ClassRepository {
  static getClassesByRoomId(roomId: string): Class[] {
    const classes = db.classes.filter((cls) => cls.roomId === roomId);
    return classes;
  }

  static getClassesByDay(day: (typeof DaysOfWeek)[number]): Class[] {
    const classes = db.classes.filter((cls) => cls.day === day);
    return classes;
  }

  static getClassesByProfessor(professorId: string): Class[] {
    const classes = db.classes.filter((cls) => cls.professorId === professorId);
    return classes;
  }

  static getClassesBySubjectId(subjectId: string): Class[] {
    const classes = db.classes.filter((cls) => cls.subjectId === subjectId);
    return classes;
  }

  public static buildLookupMaps(): LookupMaps {
    return {
      subjects: Object.fromEntries(db.subjects.map((s) => [s.id, s])),
      professors: Object.fromEntries(db.professors.map((p) => [p.id, p])),
      rooms: Object.fromEntries(db.rooms.map((r) => [r.id, r])),
    };
  }

  static hydrateClasses(
    classes: Class[],
    existingMaps?: LookupMaps,
  ): ClassWithDetails[] {
    const maps = existingMaps || ClassRepository.buildLookupMaps();
    return classes.flatMap((cls) => {
      const result = ClassRepository.hydrateClassWithMaps(cls, maps);
      if (!result.success) {
        console.error(`Failed to hydrate class ${cls}: ${result.error}`);
        return [];
      }
      return [result.data];
    });
  }

  static hydrateClass(cls: Class): Result<ClassWithDetails> {
    const subjectResult = SubjectRepository.getSubjectById(cls.subjectId);
    if (!subjectResult.success) {
      return { success: false, error: subjectResult.error };
    }

    const professorResult = ProfessorRepository.getProfessorById(
      cls.professorId,
    );
    if (!professorResult.success) {
      return { success: false, error: professorResult.error };
    }

    const roomResult = RoomRepository.getRoomById(cls.roomId);
    if (!roomResult.success) {
      return { success: false, error: roomResult.error };
    }

    return {
      success: true,
      data: {
        room: roomResult.data,
        professor: professorResult.data,
        subject: subjectResult.data,
        day: cls.day,
        start: cls.start,
        end: cls.end,
      },
    };
  }

  private static hydrateClassWithMaps(
    cls: Class,
    maps: LookupMaps,
  ): Result<ClassWithDetails> {
    const subject = maps.subjects[cls.subjectId as keyof typeof maps.subjects];
    if (!subject) {
      return { success: false, error: "Subject not found" };
    }

    const professor =
      maps.professors[cls.professorId as keyof typeof maps.professors];
    if (!professor) {
      return { success: false, error: "Professor not found" };
    }

    const room = maps.rooms[cls.roomId as keyof typeof maps.rooms];
    if (!room) {
      return { success: false, error: "Room not found" };
    }

    return {
      success: true,
      data: {
        room: new Room(cls.roomId, room.name),
        professor: new Professor(
          cls.professorId,
          professor.name,
          professor.honorific,
        ),
        subject: new Subject(
          cls.subjectId,
          subject.course_name,
          subject.subject,
        ),
        day: cls.day,
        start: cls.start,
        end: cls.end,
      },
    };
  }
}
