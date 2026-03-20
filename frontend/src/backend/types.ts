import type { Class } from "./models/class.model";
import type { Professor } from "./models/professor.model";
import type { Room } from "./models/room.model";
import type { Subject } from "./models/subject.model";

export type { Class, Professor, Room, Subject };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const DaysOfWeek = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export interface DBObject {
  subjects: Subject[];
  professors: Professor[];
  rooms: Room[];
  classes: Class[];
}

export interface ClassWithDetails extends Omit<
  Class,
  "subjectId" | "professorId" | "roomId"
> {
  subject: Subject;
  professor: Professor;
  room: Room;
}

export interface RoomWithOccupancyInfo {
  room: Room;
  currentOccupancy: ClassWithDetails | null;
  nextOccupancy: ClassWithDetails | null;
  timeUntilOccupancy: number | null; // minutes
  timeUntilFree: number | null; // minutes
  occupiedUntilEnd?: boolean;
}

export interface ProfessorWithOccupancyInfo {
  professor: Professor;
  currentOccupancy: ClassWithDetails | null;
  nextOccupancy: ClassWithDetails | null;
  timeUntilOccupancy: number | null; // minutes
  timeUntilFree: number | null; // minutes
  occupiedUntilEnd?: boolean;
}

export interface SubjectWithSchedule {
  subject: Subject;
  classes: ClassWithDetails[];
}
