import { type NextRequest, NextResponse } from "next/server";
import { RoomService } from "@/backend/services/room.service";
import { DaysOfWeek } from "@/backend/types";
import { secondsUntilNextHalfHour } from "@/backend/utils";

export function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const day = searchParams.get("day") ?? undefined;
    const time = searchParams.get("time") ?? undefined;
    const headquarters = searchParams.get("headquarters") ?? undefined;

    const isCustomQuery = day !== undefined || time !== undefined;

    if (day && !DaysOfWeek.includes(day as (typeof DaysOfWeek)[number])) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    if (time && !/^\d{1,2}:\d{2}$/.test(time)) {
      return NextResponse.json(
        { error: "Invalid time format" },
        { status: 400 },
      );
    }

    const response = RoomService.getRoomsWithState(day, time, headquarters);

    const cacheSeconds = secondsUntilNextHalfHour();

    const headers =
      process.env.NODE_ENV === "development" || isCustomQuery
        ? { "Cache-Control": "no-store, max-age=0" }
        : {
            "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`,
          };

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error fetching rooms state:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms state" },
      { status: 500 },
    );
  }
}
