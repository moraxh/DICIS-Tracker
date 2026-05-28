import { NextResponse } from "next/server";
import { SubjectRepository } from "@/backend/repositories/subject.repository";

export function GET() {
  try {
    const subjects = SubjectRepository.getAllSubjectsWithDetails();
    const courses = SubjectRepository.getAllCourses();

    return NextResponse.json(
      { subjects, courses },
      {
        headers:
          process.env.NODE_ENV === "development"
            ? { "Cache-Control": "no-store, max-age=0" }
            : { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
      },
    );
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
