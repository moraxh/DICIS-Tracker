import { db } from "@/backend/db";
import { Professor } from "@/backend/models/professor.model";
import type { Result } from "@/backend/types";

export class ProfessorRepository {
  static getProfessorById(id: string): Result<Professor> {
    const row = db
      .prepare(
        "SELECT id, names, last_names, honorific FROM professor WHERE id = ?",
      )
      .get(id) as any;
    if (!row) {
      return { success: false, error: "Professor not found" };
    }
    const fullName = `${row.names} ${row.last_names}`.trim();
    return {
      success: true,
      data: new Professor(row.id.toString(), fullName, row.honorific),
    };
  }

  static getAllProfessors(): Professor[] {
    const rows = db
      .prepare(
        "SELECT id, names, last_names, honorific FROM professor ORDER BY names",
      )
      .all() as any[];
    return rows.map((row) => {
      const fullName = `${row.names} ${row.last_names}`.trim();
      return new Professor(row.id.toString(), fullName, row.honorific);
    });
  }
}
