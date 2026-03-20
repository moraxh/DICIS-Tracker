import { NextResponse } from "next/server";
import { SubjectService } from "@/backend/services/subject.service";

export async function GET() {
  try {
    const subjects = SubjectService.getAllSubjectsWithSchedule();
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
