import { db } from "@/backend/db";
import { Professor } from "@/backend/models/professor.model";
import type { Result } from "@/backend/types";

export class ProfessorRepository {
  static getProfessorById(id: string): Result<Professor> {
    const professor = db.professors.find((prof) => prof.id === id);
    if (!professor) {
      return { success: false, error: "Professor not found" };
    }
    return {
      success: true,
      data: new Professor(id, professor.name, professor.honorific),
    };
  }

  static getAllProfessors(): Professor[] {
    return db.professors.map(
      (prof) => new Professor(prof.id, prof.name, prof.honorific),
    );
  }
}
