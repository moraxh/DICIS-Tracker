import type { Result } from "@/backend/types";
import coursesData from "@/data/courses.json";
import subjectsData from "@/data/subjects.json";

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

type SubjectRecord = SubjectWithDetails;
type CourseRecord = { id: string; name: string };

const subjects = subjectsData as SubjectRecord[];
const courses = coursesData as CourseRecord[];

export class SubjectRepository {
  static getAllSubjectsWithDetails(): SubjectWithDetails[] {
    return subjects;
  }

  static getAllCourses(): { id: string; name: string }[] {
    return courses;
  }

  static getSubjectById(id: string): Result<SubjectWithDetails> {
    const row = subjects.find((s) => s.id === id);
    if (!row) return { success: false, error: "Subject not found" };
    return { success: true, data: row };
  }
}
