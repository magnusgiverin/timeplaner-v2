// app/api/semesterplan/utils.ts
import { SemesterPlan } from "@/app/types/SemesterPlan";

export async function fetchSemesterPlans(subjectCodes: string[], semester: string): Promise<SemesterPlan[]> {
  const apiKey = "277312d4-95ba-4b24-b486-b3ca70e80da3";
  const resultArray: SemesterPlan[] = [];

  for (const subjectCode of subjectCodes) {
    const apiUrl = `https://gw-ntnu.intark.uh-it.no/tp/prod/ws/1.4/course.php?id=${subjectCode}&sem=${semester}&lang=no&split_intervals=true&exam=true`;

    const response = await fetch(apiUrl, {
      headers: { "X-Gravitee-Api-Key": apiKey },
    });

    if (!response.ok) continue;

    const semesterPlan: SemesterPlan = await response.json();
    resultArray.push(semesterPlan);
  }

  return resultArray;
}
