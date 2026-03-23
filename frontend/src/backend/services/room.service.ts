import type { Room } from "@/backend/models/room.model";
import { ClassRepository } from "@/backend/repositories/class.repository";
import { RoomRepository } from "@/backend/repositories/room.repository";
import type { ClassWithDetails, RoomWithOccupancyInfo } from "@/backend/types";
import {
  getCurrentMinutes,
  getTodayOfWeek,
  isClassNow,
  minutesUntilTime,
  timeToMinutes,
} from "@/backend/utils";

export interface RoomsWithState {
  freeRooms: RoomWithOccupancyInfo[];
  occupiedRooms: RoomWithOccupancyInfo[];
}

export interface RoomWithSchedule {
  room: Room;
  classes: ClassWithDetails[];
}

export class RoomService {
  static getRoomsWithState(): RoomsWithState {
    const todayDayOfWeek = getTodayOfWeek();
    const hydratedClasses = ClassRepository.getClassesByDay(todayDayOfWeek);

    const allRooms = RoomRepository.getAllRooms();

    const currentMinutes = getCurrentMinutes();
    const classesNow = hydratedClasses.filter((cls) =>
      isClassNow(cls, currentMinutes),
    );

    // Create a map for quick lookup of current classes by room
    const currentClassesByRoom = new Map<string, ClassWithDetails>();
    classesNow.forEach((cls) => {
      currentClassesByRoom.set(cls.room.id, cls);
    });

    // Enrich rooms with occupancy information
    const enrichedRooms = allRooms.map((room) => {
      const currentOccupancy = currentClassesByRoom.get(room.id) || null;
      const roomClasses = hydratedClasses
        .filter((cls) => cls.room.id === room.id)
        .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

      // Get next occupancy (next class after current time)
      const nextOccupancy =
        roomClasses.find((cls) => {
          const classStart = timeToMinutes(cls.start);
          return classStart > currentMinutes;
        }) || null;

      // Calculate time until occupation or freedom
      let timeUntilOccupancy: number | null = null;
      let timeUntilFree: number | null = null;
      let occupiedUntilEnd = false;

      if (currentOccupancy) {
        // Room is occupied - calculate when it becomes free
        let actualEndClass = currentOccupancy;
        let keepChecking = true;

        while (keepChecking) {
          const nextConsecutiveClass = roomClasses.find(
            (cls) =>
              timeToMinutes(cls.start) === timeToMinutes(actualEndClass.end),
          );

          if (nextConsecutiveClass) {
            actualEndClass = nextConsecutiveClass;
          } else {
            keepChecking = false;
          }
        }

        timeUntilFree = minutesUntilTime(actualEndClass.end);

        // Check if the current block of classes ends at or after 6 PM (18:00)
        if (timeToMinutes(actualEndClass.end) >= timeToMinutes("18:00")) {
          occupiedUntilEnd = true;
        }
      } else if (nextOccupancy) {
        // Room is free - calculate when it becomes occupied
        timeUntilOccupancy = minutesUntilTime(nextOccupancy.start);
      }

      return {
        room,
        currentOccupancy,
        nextOccupancy,
        timeUntilOccupancy,
        timeUntilFree,
        occupiedUntilEnd,
      } as RoomWithOccupancyInfo;
    });

    const freeRooms = enrichedRooms.filter((r) => !r.currentOccupancy);
    const occupiedRooms = enrichedRooms.filter((r) => r.currentOccupancy);

    return {
      freeRooms,
      occupiedRooms,
    };
  }

  static getRoomSchedule(roomId: string): RoomWithSchedule | null {
    const room = RoomRepository.getRoomById(roomId);
    if (!room.success) {
      console.error(`Room not found: ${roomId}`);
      return null;
    }

    const hydratedClasses = ClassRepository.getClassesByRoomId(roomId);

    return {
      room: room.data,
      classes: hydratedClasses,
    };
  }
}
