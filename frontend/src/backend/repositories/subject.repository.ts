import type { Result } from "@/backend/types";
import coursesData from "@/data/courses.json";
import subjectsData from "@/data/subjects.json";

export interface SubjectWithDetails {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  locationId: string;
  campus: string;
  division: string;
  headquarters: string;
  professor: string;
  honorific: string;
  professorId: string;
  roomName: string;
  roomId: string;
}

type SubjectRecord = SubjectWithDetails;
type CourseRecord = {
  id: string;
  name: string;
  locationId: string;
  campus: string;
  division: string;
  headquarters: string;
};

const subjects = subjectsData as SubjectRecord[];
const courses = coursesData as CourseRecord[];

export class SubjectRepository {
  static getAllSubjectsWithDetails(
    headquarters?: string,
  ): SubjectWithDetails[] {
    return subjects.filter(
      (subject) => !headquarters || subject.headquarters === headquarters,
    );
  }

  static getAllCourses(headquarters?: string): Array<
    CourseRecord & {
      label: string;
    }
  > {
    const filteredCourses = courses.filter(
      (course) => !headquarters || course.headquarters === headquarters,
    );

    const duplicateCounts = filteredCourses.reduce<Record<string, number>>(
      (acc, course) => {
        acc[course.name] = (acc[course.name] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return filteredCourses.map((course) => ({
      ...course,
      label:
        duplicateCounts[course.name] > 1
          ? `${course.name} - ${course.headquarters}`
          : course.name,
    }));
  }

  static getSubjectById(id: string): Result<SubjectWithDetails> {
    const row = subjects.find((s) => s.id === id);
    if (!row) return { success: false, error: "Subject not found" };
    return { success: true, data: row };
  }
}
