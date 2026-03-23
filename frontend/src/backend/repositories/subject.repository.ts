import { db } from "@/backend/db";
import { Subject } from "@/backend/models/subject.model";
import type { Result } from "@/backend/types";

export class SubjectRepository {
  static getSubjectById(id: string): Result<Subject> {
    const row = db
      .prepare(`
      SELECT c.id, c.subject, co.name as course_name 
      FROM class c
      JOIN course co ON c.course_id = co.id
      WHERE c.id = ?
    `)
      .get(id) as any;

    if (!row) {
      return { success: false, error: "Subject not found" };
    }

    return {
      success: true,
      data: new Subject(row.id.toString(), row.course_name, row.subject),
    };
  }
}
