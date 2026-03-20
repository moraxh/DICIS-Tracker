import { NextResponse } from "next/server";
import { RoomService } from "@/backend/services/room.service";
import { secondsUntilNextHalfHour } from "@/backend/utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = RoomService.getRoomSchedule(id);

    if (!response) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const cacheSeconds = secondsUntilNextHalfHour();

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`,
      },
    });
  } catch (error) {
    console.error("Error fetching room schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch room schedule" },
      { status: 500 },
    );
  }
}
