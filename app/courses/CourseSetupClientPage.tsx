"use client";

import { useEffect, useState, useMemo } from "react";
import StepDescription from "@/app/components/StepDescription";
import { ApiCourse } from "@/app/types/Courses";
import { useRouter } from "next/navigation";

const CourseSetupClientPage = () => {
  const [semester, setSemester] = useState<string>();
  const [availableCourses, setAvailableCourses] = useState<ApiCourse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState("h");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        console.log("Fetching courses for semester:", semester);
        const res = await fetch(`/api/courses?semesterCode=${semester}`);
        const data = await res.json();
        setAvailableCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [semester]);

  useEffect(() => {
    const yearStr = String(year);

    if (yearStr.trim() !== "") {
      const value = `${yearStr.slice(-2)}${season}`;
      const isValid = /^[0-9]{2}[hv]$/i.test(value); // Example: "24h" or "24v"

      if (isValid && yearStr.length === 4) {
        setSemester(value);
      }
    }
  }, [season, year, setSemester]);

  const filteredCourses = useMemo(() => {
    const filtered = availableCourses.filter(
      (course) =>
        course.name?.toLowerCase().includes(search.toLowerCase()) ||
        course.courseid?.toLowerCase().includes(search.toLowerCase()),
    );

    return [...new Map(filtered.map((c) => [c.courseid, c])).values()];
  }, [availableCourses, search]);

  const handleToggleCourse = (courseId: string) => {
    const course = availableCourses.find((c) => c.courseid === courseId);
    if (!course) return;

    setSelectedCourses((prev) =>
      prev.some((c) => c.courseid === courseId)
        ? prev.filter((c) => c.courseid !== courseId)
        : [...prev, course],
    );

    if (search && filteredCourses.length === 1) setSearch("");
  };

  const handleNavigateToCalendar = () => {
    const alias = Object.fromEntries(
      selectedCourses.map((course) => [course.courseid, course.name]),
    );
    router.push(
      "/calendar?courses=" +
        JSON.stringify(selectedCourses.map((c) => c.courseid)) +
        `&semester=${semester}&alias=${JSON.stringify(alias)}`,
    );
  };

  const processCommaSeparatedCodes = () => {
    const codes = search
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);

    const matchedCourses = codes
      .map((code) =>
        availableCourses.find((c) => c.courseid.toUpperCase() === code),
      )
      .filter(Boolean) as ApiCourse[];

    if (matchedCourses.length > 0) {
      setSelectedCourses((prev) => {
        // Avoid duplicates
        const existingIds = new Set(prev.map((c) => c.courseid));
        const newCourses = matchedCourses.filter(
          (c) => !existingIds.has(c.courseid),
        );
        return [...prev, ...newCourses];
      });
      setSearch(""); // clear input
    }
  };

  return (
    <div className="flex flex-col items-center pt-20 gap-20 w-full">
      <span className="flex flex-col gap-8 items-center w-full">
        <StepDescription
          number="1"
          title="Velg fag du skal ta"
          description="Søk etter og velg fag du ønsker å inkludere i kalenderen din. Du kan også skrive inn kommaseparerte fagkoder."
        />
        {/* Search */}
        <div className="w-full max-w-4xl flex flex-row gap-2 h-12">
          <input
            type="text"
            placeholder="Søk etter fag eller skriv kommaseparerte fagkoder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                processCommaSeparatedCodes();
              }
            }}
            className="highlight-border-burnt-peach p-4 border-b-2 border-terracotta-clay w-2/3 focus:outline-none"
          />

          {/* Season selector */}
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="h-12 w-1/6 border-b-2 border-terracotta-clay focus:outline-none"
          >
            <option value="h">Høst</option>
            <option value="v">Vår</option>
          </select>

          {/* Year input */}
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-12 w-1/6 border-b-2 border-terracotta-clay focus:outline-none"
            placeholder="År (2024)"
            min="2000"
            max="2100"
          />

          {selectedCourses.length > 0 && (
            <button
              onClick={handleNavigateToCalendar}
              className="cursor-pointer transition hover:bg-terracotta-clay w-12 h-12 bg-burnt-peach rounded-full p-4 whitespace-nowrap text-bright-white flex flex-row gap-2 justify-center items-center"
            >
              <span className="material-icons">arrow_forward</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-5 bg-powder-petal animate-pulse"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  animationDuration: "1s",
                }}
              >
                <div className="h-4 w-20 bg-rosy-taupe/30 rounded mb-3"></div>
                <div className="h-3 w-full bg-rosy-taupe/20 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Selected courses */}
        {selectedCourses.length > 0 && (
          <div className="w-full flex flex-wrap gap-2 mt-8 flex-row">
            {selectedCourses.map((course) => (
              <span
                key={course.courseid}
                onClick={() => handleToggleCourse(course.courseid)}
                className="flex flex-row items-center justify-center gap-2 whitespace-nowrap truncate rounded-full bg-terracotta-clay text-powder-petal px-4 py-2 text-sm font-medium cursor-pointer hover:scale-102 transition duration-200"
              >
                <span className="material-icons">close</span>
                {course.name}
              </span>
            ))}
          </div>
        )}

        {/* Course cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {!loading &&
            filteredCourses
              .filter(
                (c) => !selectedCourses.some((s) => s.courseid === c.courseid),
              )
              .map((course) => (
                <div
                  key={course.courseid}
                  onClick={() => handleToggleCourse(course.courseid)}
                  className="rounded-xl p-5 bg-powder-petal hover:shadow-rosy-taupe hover:scale-105 transition cursor-pointer"
                >
                  <p>{course.courseid}</p>
                  <p className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                    {course.name}
                  </p>
                </div>
              ))}
          {search.includes(",") &&
            availableCourses
              .filter((c) => {
                const codes = search
                  .split(",")
                  .map((code) => code.trim().toUpperCase());
                return (
                  codes.includes(c.courseid.toUpperCase()) &&
                  !selectedCourses.some((s) => s.courseid === c.courseid)
                );
              })
              .map((course) => (
                <div
                  key={course.courseid}
                  onClick={() => handleToggleCourse(course.courseid)}
                  className="rounded-xl p-5 bg-powder-petal hover:shadow-rosy-taupe hover:scale-105 transition cursor-pointer"
                >
                  <p>{course.courseid}</p>
                  <p className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                    {course.name}
                  </p>
                </div>
              ))}
        </div>

        {!loading && filteredCourses.length === 0 && !search.includes(",") && (
          <p className="text-center text-burnt-peach">
            Ingen kurs funnet for {semester}
          </p>
        )}
      </span>
    </div>
  );
};

export default CourseSetupClientPage;
