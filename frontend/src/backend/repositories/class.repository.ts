import { db } from "@/backend/db";
import type { Class } from "@/backend/models/class.model";
import { Professor } from "@/backend/models/professor.model";
import { Room } from "@/backend/models/room.model";
import { Subject } from "@/backend/models/subject.model";
import type { ClassWithDetails, DaysOfWeek, Result } from "@/backend/types";
import { ProfessorRepository } from "./professor.repository";
import { RoomRepository } from "./room.repository";
import { SubjectRepository } from "./subject.repository";

export class ClassRepository {
  private static getHydratedClassesWithCondition(
    whereClause: string,
    ...params: any[]
  ): ClassWithDetails[] {
    const rows = db
      .prepare(`
      SELECT 
        s.day,
        strftime('%H:%M', s.start_time) as start,
        strftime('%H:%M', s.end_time) as end,
        c.id as subjectId,
        c.subject as subjectName,
        co.name as courseName,
        p.id as professorId,
        p.names as profNames,
        p.last_names as profLastNames,
        p.honorific as profHonorific,
        r.id as roomId,
        r.name as roomName
      FROM schedule s
      JOIN class c ON s.class_id = c.id
      JOIN course co ON c.course_id = co.id
      JOIN professor p ON c.professor_id = p.id
      JOIN room r ON c.room_id = r.id
      ${whereClause}
    `)
      .all(...params) as any[];

    return rows.map((row) => ({
      day: row.day,
      start: row.start,
      end: row.end,
      subject: new Subject(
        row.subjectId.toString(),
        row.courseName,
        row.subjectName,
      ),
      professor: new Professor(
        row.professorId.toString(),
        `${row.profNames} ${row.profLastNames}`.trim(),
        row.profHonorific,
      ),
      room: new Room(row.roomId.toString(), row.roomName),
    }));
  }

  static getClassesByRoomId(roomId: string): ClassWithDetails[] {
    return ClassRepository.getHydratedClassesWithCondition(
      "WHERE c.room_id = ?",
      roomId,
    );
  }

  static getClassesByDay(day: (typeof DaysOfWeek)[number]): ClassWithDetails[] {
    return ClassRepository.getHydratedClassesWithCondition(
      "WHERE s.day = ?",
      day,
    );
  }

  static getClassesByProfessor(professorId: string): ClassWithDetails[] {
    return ClassRepository.getHydratedClassesWithCondition(
      "WHERE c.professor_id = ?",
      professorId,
    );
  }

  static hydrateClasses(_classes: Class[]): ClassWithDetails[] {
    // This method is kept for backwards compatibility but shouldn't be needed
    // now that getClassesBy* methods return fully hydrated lists.
    return [];
  }

  static hydrateClass(_cls: Class): Result<ClassWithDetails> {
    // Left for backwards compatibility. Never called actually.
    return { success: false, error: "Not implemented after DB refactor" };
  }
}
