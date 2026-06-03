import { Professor } from "@/backend/models/professor.model";
import type { Result } from "@/backend/types";
import professorsData from "@/data/professors.json";

type ProfessorRecord = {
  id: string;
  fullName: string;
  honorific: string;
  headquarters?: string;
};
const data = professorsData as ProfessorRecord[];

export class ProfessorRepository {
  static getProfessorById(id: string): Result<Professor> {
    const row = data.find((p) => p.id === id);
    if (!row) return { success: false, error: "Professor not found" };
    return {
      success: true,
      data: new Professor(row.id, row.fullName, row.honorific),
    };
  }

  static getAllProfessors(headquarters?: string): Professor[] {
    return data
      .filter((r) => !headquarters || r.headquarters === headquarters)
      .map((r) => new Professor(r.id, r.fullName, r.honorific));
  }
}
