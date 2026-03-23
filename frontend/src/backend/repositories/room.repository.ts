import { db } from "@/backend/db";
import { Room } from "@/backend/models/room.model";
import type { Result } from "@/backend/types";

export class RoomRepository {
  static getRoomById(id: string): Result<Room> {
    const row = db
      .prepare("SELECT id, name FROM room WHERE id = ?")
      .get(id) as any;
    if (!row) {
      return { success: false, error: "Room not found" };
    }
    return {
      success: true,
      data: new Room(row.id.toString(), row.name),
    };
  }

  static getAllRooms(): Room[] {
    const rows = db
      .prepare("SELECT id, name FROM room ORDER BY name")
      .all() as any[];
    return rows.map((row) => new Room(row.id.toString(), row.name));
  }
}
