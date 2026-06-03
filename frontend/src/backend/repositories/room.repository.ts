import { Room } from "@/backend/models/room.model";
import type { Result } from "@/backend/types";
import roomsData from "@/data/rooms.json";

type RoomRecord = { id: string; name: string; headquarters?: string };
const data = roomsData as RoomRecord[];

export class RoomRepository {
  static getRoomById(id: string): Result<Room> {
    const row = data.find((r) => r.id === id);
    if (!row) return { success: false, error: "Room not found" };
    return { success: true, data: new Room(row.id, row.name) };
  }

  static getAllRooms(headquarters?: string): Room[] {
    return data
      .filter((r) => !headquarters || r.headquarters === headquarters)
      .map((r) => new Room(r.id, r.name));
  }
}
