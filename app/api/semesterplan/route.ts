import { NextRequest, NextResponse } from "next/server";
import { fetchSemesterPlans } from "./utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjectCodes, semester } = body;

    if (!subjectCodes || !semester) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const plans = await fetchSemesterPlans(subjectCodes, semester);
    return NextResponse.json(plans, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
