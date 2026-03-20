import { db } from "@/backend/db";
import { Subject } from "@/backend/models/subject.model";
import type { Result } from "@/backend/types";

export class SubjectRepository {
  static getSubjectById(id: string): Result<Subject> {
    const subject = db.subjects.find((subj) => subj.id === id);
    if (!subject) {
      return { success: false, error: "Subject not found" };
    }
    return {
      success: true,
      data: new Subject(id, subject.course_name, subject.subject),
    };
  }

  static getAllSubjects(): Subject[] {
    return db.subjects.map(
      (s) => new Subject(s.id, s.course_name, s.subject),
    );
  }
}
