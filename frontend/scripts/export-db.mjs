import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dbPath = path.join(root, "src", "data.db");
const outDir = path.join(root, "src", "data");

mkdirSync(outDir, { recursive: true });

const db = new Database(dbPath, { readonly: true });

// professors
const professors = db
  .prepare(
    "SELECT id, names, last_names, honorific FROM professor ORDER BY names",
  )
  .all()
  .map((r) => ({
    id: r.id.toString(),
    fullName: `${r.names} ${r.last_names}`.trim(),
    honorific: r.honorific,
  }));
writeFileSync(path.join(outDir, "professors.json"), JSON.stringify(professors));

// rooms
const rooms = db
  .prepare("SELECT id, name FROM room ORDER BY name")
  .all()
  .map((r) => ({ id: r.id.toString(), name: r.name }));
writeFileSync(path.join(outDir, "rooms.json"), JSON.stringify(rooms));

// courses
const courses = db
  .prepare("SELECT id, name FROM course ORDER BY name")
  .all()
  .map((r) => ({ id: r.id.toString(), name: r.name }));
writeFileSync(path.join(outDir, "courses.json"), JSON.stringify(courses));

// subjects with details
const subjects = db
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
  .all()
  .map((r) => ({
    id: r.id.toString(),
    name: r.name,
    courseName: r.courseName,
    courseId: r.courseId.toString(),
    professor: r.professorName.trim(),
    honorific: r.honorific,
    professorId: r.professorId.toString(),
    roomName: r.roomName,
    roomId: r.roomId.toString(),
  }));
writeFileSync(path.join(outDir, "subjects.json"), JSON.stringify(subjects));

// classes with schedule (hydrated)
const classes = db
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
  `)
  .all()
  .map((r) => ({
    day: r.day,
    start: r.start,
    end: r.end,
    subjectId: r.subjectId.toString(),
    subjectName: r.subjectName,
    courseName: r.courseName,
    professorId: r.professorId.toString(),
    professorName: `${r.profNames} ${r.profLastNames}`.trim(),
    professorHonorific: r.profHonorific,
    roomId: r.roomId.toString(),
    roomName: r.roomName,
  }));
writeFileSync(path.join(outDir, "classes.json"), JSON.stringify(classes));

console.log(
  `Exported: ${professors.length} professors, ${rooms.length} rooms, ${courses.length} courses, ${subjects.length} subjects, ${classes.length} schedule entries`,
);
