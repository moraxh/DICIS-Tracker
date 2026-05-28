import { db } from "@/backend/db";
import type { Result } from "@/backend/types";

export interface SubjectWithDetails {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  professor: string;
  honorific: string;
  professorId: string;
  roomName: string;
  roomId: string;
}

export class SubjectRepository {
  static getAllSubjectsWithDetails(): SubjectWithDetails[] {
    const rows = db
      .prepare(`
        SELECT
          c.id,
          c.subject as name,
          co.name as courseName,
          co.id as courseId,
          p.names || ' ' || p.last_names as professorName,
          p.honorific,
          p.id as professorId,
          r.name as roomName,
          r.id as roomId
        FROM class c
        JOIN course co ON c.course_id = co.id
        JOIN professor p ON c.professor_id = p.id
        JOIN room r ON c.room_id = r.id
        ORDER BY c.subject ASC
      `)
      .all() as any[];

    return rows.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      courseName: row.courseName,
      courseId: row.courseId.toString(),
      professor: row.professorName.trim(),
      honorific: row.honorific,
      professorId: row.professorId.toString(),
      roomName: row.roomName,
      roomId: row.roomId.toString(),
    }));
  }

  static getAllCourses(): { id: string; name: string }[] {
    const rows = db
      .prepare("SELECT id, name FROM course ORDER BY name")
      .all() as any[];
    return rows.map((row) => ({ id: row.id.toString(), name: row.name }));
  }

  static getSubjectById(id: string): Result<SubjectWithDetails> {
    const row = db
      .prepare(`
        SELECT
          c.id,
          c.subject as name,
          co.name as courseName,
          co.id as courseId,
          p.names || ' ' || p.last_names as professorName,
          p.honorific,
          p.id as professorId,
          r.name as roomName,
          r.id as roomId
        FROM class c
        JOIN course co ON c.course_id = co.id
        JOIN professor p ON c.professor_id = p.id
        JOIN room r ON c.room_id = r.id
        WHERE c.id = ?
      `)
      .get(id) as any;

    if (!row) {
      return { success: false, error: "Subject not found" };
    }

    return {
      success: true,
      data: {
        id: row.id.toString(),
        name: row.name,
        courseName: row.courseName,
        courseId: row.courseId.toString(),
        professor: row.professorName.trim(),
        honorific: row.honorific,
        professorId: row.professorId.toString(),
        roomName: row.roomName,
        roomId: row.roomId.toString(),
      },
    };
  }
}
