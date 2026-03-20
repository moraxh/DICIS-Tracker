import { db } from "@/backend/db";
import { Subject } from "@/backend/models/subject.model";
import { ClassRepository } from "@/backend/repositories/class.repository";
import { SubjectRepository } from "@/backend/repositories/subject.repository";
import type { ClassWithDetails } from "@/backend/types";

export interface SubjectWithSchedule {
  subject: Subject;
  classes: ClassWithDetails[];
}

export class SubjectService {
  static getAllSubjectsWithSchedule(): SubjectWithSchedule[] {
    const allSubjects = SubjectRepository.getAllSubjects();
    const allClasses = db.classes;
    const maps = ClassRepository.buildLookupMaps();

    // Group classes by subjectId for efficiency O(M)
    const classesBySubject = new Map<string, any[]>();
    allClasses.forEach((cls: any) => {
      if (!classesBySubject.has(cls.subjectId)) {
        classesBySubject.set(cls.subjectId, []);
      }
      classesBySubject.get(cls.subjectId)!.push(cls);
    });

    return allSubjects.map((subject) => {
      const classes = classesBySubject.get(subject.id) || [];
      const hydratedClasses = ClassRepository.hydrateClasses(classes, maps);

      return {
        subject,
        classes: hydratedClasses,
      };
    });
  }

  static getSubjectSchedule(subjectId: string): SubjectWithSchedule | null {
    const subjectResult = SubjectRepository.getSubjectById(subjectId);
    if (!subjectResult.success) {
      console.error(`Subject not found: ${subjectId}`);
      return null;
    }

    const classes = ClassRepository.getClassesBySubjectId(subjectId);
    const hydratedClasses = ClassRepository.hydrateClasses(classes);

    return {
      subject: subjectResult.data,
      classes: hydratedClasses,
    };
  }
}
