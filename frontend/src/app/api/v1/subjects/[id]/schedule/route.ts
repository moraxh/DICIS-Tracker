import { NextResponse } from "next/server";
import { SubjectService } from "@/backend/services/subject.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schedule = SubjectService.getSubjectSchedule(id);
    if (!schedule) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    return NextResponse.json(schedule);
  } catch (error) {
    const { id } = await params;
    console.error(`Error fetching schedule for subject ${id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
