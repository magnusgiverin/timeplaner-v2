import { NextRequest, NextResponse } from "next/server";
import { SemesterPlan } from "@/app/types/SemesterPlan";
import { createEvents } from "ics";
import { parseISO } from "date-fns";

interface EventState {
  [courseId: string]: Record<string, boolean>;
}

async function fetchSemesterPlans(
  courses: string[],
  semester: string,
): Promise<SemesterPlan[]> {
  const apiKey = "277312d4-95ba-4b24-b486-b3ca70e80da3";
  const semesterPlans: SemesterPlan[] = [];

  for (const courseCode of courses) {
    const apiUrl = `https://gw-ntnu.intark.uh-it.no/tp/prod/ws/1.4/course.php?id=${courseCode}&sem=${semester}&lang=no&split_intervals=true&exam=true`;
    const res = await fetch(apiUrl, {
      headers: { "X-Gravitee-Api-Key": apiKey },
    });
    if (!res.ok) continue;
    const plan: SemesterPlan = await res.json();
    semesterPlans.push(plan);
  }

  return semesterPlans;
}

function generateICSEvents(
  semesterPlans: SemesterPlan[],
  state: EventState,
  alias: { [courseId: string]: string } = {},
) {
  const weekdays = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

  return semesterPlans.flatMap((plan) => {
    const courseState = state[plan.courseid] ?? {};

    return plan.events
      .filter((ev) => {
        const weekdayName = weekdays[ev.weekday - 1];
        const key = `${ev.aid}-${weekdayName}`;
        // If not in state, default to visible
        return courseState[key] ?? true;
      })
      .map((ev) => {
        const startDate = parseISO(ev.dtstart.replace(" ", "T"));
        const endDate = parseISO(ev.dtend.replace(" ", "T"));

        const groups = (ev.studentgroups ?? []).join(", ");

        return {
          title: `${alias[plan.courseid] ?? plan.coursename} - ${ev.summary}`,
          start: [
            startDate.getFullYear(),
            startDate.getMonth() + 1,
            startDate.getDate(),
            startDate.getHours(),
            startDate.getMinutes(),
          ] as [number, number, number, number, number],
          end: [
            endDate.getFullYear(),
            endDate.getMonth() + 1,
            endDate.getDate(),
            endDate.getHours(),
            endDate.getMinutes(),
          ] as [number, number, number, number, number],
          location: ev.room?.map((r) => r.roomname).join(", ") ?? "",
          description: groups ? `Student groups: ${groups}` : "",
        };
      });
  });
}

async function handleRequest(
  courses: string[],
  semester: string,
  state: EventState,
  alias: { [courseId: string]: string } = {},
) {
  const semesterPlans = await fetchSemesterPlans(courses, semester);
  const icsEvents = generateICSEvents(semesterPlans, state, alias);
  const { error, value } = createEvents(icsEvents);

  if (error) throw error instanceof Error ? error : new Error(String(error));

  return new NextResponse(value, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="calendar.ics"`,
    },
  });
}

// Handle POST
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courses, semester, state, alias } = body as {
      courses: string[];
      semester: string;
      state: EventState;
      alias: { [courseId: string]: string };
    };

    if (!courses || !semester)
      return NextResponse.json(
        { error: "Missing courses or semester" },
        { status: 400 },
      );

    return await handleRequest(courses, semester, state || {}, alias || {});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const coursesRaw = url.searchParams.get("courses") || "";
    const semester = url.searchParams.get("semester") || "";
    const stateRaw = url.searchParams.get("state") || "";
    const aliasRaw = url.searchParams.get("alias") || "";

    if (!coursesRaw || !semester) {
      return new NextResponse("Missing courses or semester", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // courses="AAR4360,AAR4235"
    const courses = coursesRaw.split(",").map((c) => c.trim());

    // state is optional, decode if present
    let state: EventState = {};
    try {
      if (stateRaw) {
        state = JSON.parse(decodeURIComponent(stateRaw));
      }
    } catch (err) {
      console.error("Failed to parse state:", err);
    }

    // alias="AAR1025:Math,AAR4208:Physics"
    const alias: { [courseId: string]: string } = {};
    if (aliasRaw) {
      aliasRaw.split(",").forEach((pair) => {
        const [key, value] = pair.split(":");
        if (key && value) alias[key] = value;
      });
    }

    // Generate ICS and return
    return await handleRequest(courses, semester, state, alias);
  } catch (err) {
    console.error(err);
    return new NextResponse("Server error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
