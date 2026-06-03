import { type NextRequest, NextResponse } from "next/server";
import { ProfessorService } from "@/backend/services/professor.service";

export function GET(request: NextRequest) {
  try {
    const headquarters =
      request.nextUrl.searchParams.get("headquarters") ?? undefined;
    const response = ProfessorService.getProfessorsWithState(headquarters);

    const headers: Record<string, string> =
      process.env.NODE_ENV === "development"
        ? {
            "Cache-Control": "no-store, max-age=0",
          }
        : {};

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("Error fetching professors state:", error);
    return NextResponse.json(
      { error: "Failed to fetch professors state" },
      { status: 500 },
    );
  }
}
