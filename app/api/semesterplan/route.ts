// app/api/semesterplan/route.ts
import { SemesterPlan } from "@/app/types/SemesterPlan";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { subjectCodes, semester } = body;

    if (
      !subjectCodes ||
      !Array.isArray(subjectCodes) ||
      subjectCodes.length === 0 ||
      !semester ||
      typeof semester !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid input: subjectCodes and semester are required" },
        { status: 400 }
      );
    }

    const apiKey = "277312d4-95ba-4b24-b486-b3ca70e80da3";
    const resultArray: SemesterPlan[] = [];

    for (const subjectCode of subjectCodes) {
      const apiUrl = `https://gw-ntnu.intark.uh-it.no/tp/prod/ws/1.4/course.php?id=${subjectCode}&sem=${semester}&lang=no&split_intervals=true&exam=true`;

      const response = await fetch(apiUrl, {
        headers: { "X-Gravitee-Api-Key": apiKey },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch data for ${subjectCode}` },
          { status: response.status }
        );
      }

      const semesterPlan: SemesterPlan = await response.json();
      resultArray.push(semesterPlan);
    }

    return NextResponse.json(resultArray, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Invalid request or server error" },
      { status: 400 }
    );
  }
}
