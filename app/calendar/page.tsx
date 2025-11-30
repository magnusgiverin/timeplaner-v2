import { SemesterPlan } from "../types/SemesterPlan";
import CalendarClientPage from "./CalendarClientPage";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
    searchParams: Promise<{ courses?: string; semester?: string }>;
}
export default async function CalendarPage({
    searchParams,
}: CalendarPageProps) {
    const { courses, semester } = await searchParams;

    if (!courses) {
        throw new Error("Missing courses");
    }

    if (!semester) {
        throw new Error("Missing semester");
    }

    let selectedCourses: string[];
    try {
        selectedCourses = JSON.parse(courses);
    } catch (err) {
        console.error("Failed to parse selectedCourses:", err);
        throw new Error("Invalid selectedCourses format");
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const semesterplanRes = await fetch(`${baseUrl}/api/semesterplan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            subjectCodes: selectedCourses,
            semester: semester,
        }),
    });

    if (!semesterplanRes.ok) {
        throw new Error(`Failed to fetch semester plan: ${semesterplanRes.status}`);
    }

    const semesterPlans = await semesterplanRes.json();

    return (
        <CalendarClientPage semesterPlans={semesterPlans}/>
    );
}
