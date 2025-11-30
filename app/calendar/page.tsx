import { fetchSemesterPlans } from "@/app/api/semesterplan/utils";
import CalendarClientPage from "./CalendarClientPage";

export const dynamic = "force-dynamic";

interface CalendarPageProps {
  searchParams: Promise<{ courses?: string; semester?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const { courses, semester } = await searchParams;

  if (!courses || !semester) throw new Error("Missing courses or semester");

  const selectedCourses = JSON.parse(courses);
  const semesterPlans = await fetchSemesterPlans(selectedCourses, semester);

  return <CalendarClientPage semesterPlans={semesterPlans} />;
}
