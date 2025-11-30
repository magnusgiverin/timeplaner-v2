// app/api/getCourses/route.ts
import { CourseData, ApiCourse } from "@/app/types/Courses";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semesterCode = searchParams.get("semesterCode");

  if (!semesterCode) {
    return NextResponse.json({ error: "Missing semesterCode" }, { status: 400 });
  }

  const url = `https://tp.educloud.no/ntnu/timeplan/emner.php?sem=${semesterCode}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch courses. Status ${response.status}` }, { status: response.status });
    }

    const rawData = await response.text();
    const matches = /var courses = (\[[\s\S]*?\]);/.exec(rawData);

    if (!matches) {
      return NextResponse.json({ error: 'Variable "courses" not found in the response' }, { status: 500 });
    }

    const coursesData: string | null = matches[1] ?? null;
    const coursesList = coursesData ? JSON.parse(coursesData) as CourseData[] : [];

    const courses: ApiCourse[] = coursesList.map((courseData: CourseData) => ({
      courseid: courseData.id,
      name: courseData.name,
      fullname_en: courseData.fullname_en,
      fullname_nn: courseData.fullname_nn,
      idtermin: courseData.idtermin,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Error fetching courses" }, { status: 500 });
  }
}
