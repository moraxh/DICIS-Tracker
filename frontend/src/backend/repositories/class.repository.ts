import { Professor } from "@/backend/models/professor.model";
import { Room } from "@/backend/models/room.model";
import { Subject } from "@/backend/models/subject.model";
import type { ClassWithDetails, DaysOfWeek } from "@/backend/types";
import classesData from "@/data/classes.json";

type ClassRecord = {
  day: string;
  start: string;
  end: string;
  subjectId: string;
  subjectName: string;
  courseName: string;
  professorId: string;
  professorName: string;
  professorHonorific: string;
  roomId: string;
  roomName: string;
};

const data = classesData as ClassRecord[];

function toClassWithDetails(r: ClassRecord): ClassWithDetails {
  return {
    day: r.day,
    start: r.start,
    end: r.end,
    subject: new Subject(r.subjectId, r.courseName, r.subjectName),
    professor: new Professor(
      r.professorId,
      r.professorName,
      r.professorHonorific,
    ),
    room: new Room(r.roomId, r.roomName),
  };
}

export class ClassRepository {
  static getClassesByRoomId(roomId: string): ClassWithDetails[] {
    return data.filter((r) => r.roomId === roomId).map(toClassWithDetails);
  }

  static getClassesByDay(day: (typeof DaysOfWeek)[number]): ClassWithDetails[] {
    return data.filter((r) => r.day === day).map(toClassWithDetails);
  }

  static getClassesByProfessor(professorId: string): ClassWithDetails[] {
    return data
      .filter((r) => r.professorId === professorId)
      .map(toClassWithDetails);
  }
}
