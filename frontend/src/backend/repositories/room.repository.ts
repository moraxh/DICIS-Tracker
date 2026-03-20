import { db } from "@/backend/db";
import { Room } from "@/backend/models/room.model";
import type { Result } from "@/backend/types";

export class RoomRepository {
  static getRoomById(id: string): Result<Room> {
    const room = db.rooms.find((r) => r.id === id);
    if (!room) {
      return { success: false, error: "Room not found" };
    }
    return {
      success: true,
      data: new Room(id, room.name),
    };
  }

  static getAllRooms(): Room[] {
    return db.rooms.map((room) => new Room(room.id, room.name));
  }
}
