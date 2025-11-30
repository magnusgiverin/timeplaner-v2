'use client';

import { useEffect, useState, useMemo } from "react";
import StepDescription from "@/app/components/StepDescription";
import { ApiCourse } from "@/app/types/Courses";
import SemesterPicker from "../components/SemesterPicker";
import { useRouter } from "next/navigation";

const CourseSetupClientPage = () => {
  const [semester, setSemester] = useState<string>();
  const [availableCourses, setAvailableCourses] = useState<ApiCourse[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<ApiCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
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

  const filteredCourses = useMemo(() => {
    const filtered = availableCourses.filter(course =>
      course.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.courseid?.toLowerCase().includes(search.toLowerCase())
    );

    return [...new Map(filtered.map(c => [c.courseid, c])).values()];
  }, [availableCourses, search]);

  const handleToggleCourse = (courseId: string) => {
    const course = availableCourses.find(c => c.courseid === courseId);
    if (!course) return;

    setSelectedCourses(prev =>
      prev.some(c => c.courseid === courseId)
        ? prev.filter(c => c.courseid !== courseId)
        : [...prev, course]
    );

    if (search && filteredCourses.length === 1) setSearch("");
  };

  const handleNavigateToCalendar = () => {
    router.push("/calendar?courses=" + JSON.stringify(selectedCourses.map(c => c.courseid)) + `&semester=${semester}`);
  };

  return (
    <div className="flex flex-col items-center pt-20 gap-20 w-full">

      <span className="flex flex-col gap-8 items-center w-full">
        <StepDescription
          number="1"
          title="Velg semester"
          description="Velg semesteret du ønsker å se fag for."
        />

        <SemesterPicker semester={semester || ""} setSemester={setSemester} />
      </span>
      <span className="flex flex-col gap-8 items-center w-full">

        <StepDescription
          number="2"
          title="Velg fag & lag kalender"
          description="Søk etter og velg fag du ønsker å inkludere i kalenderen din."
        />
        {/* Search */}
        <div className="w-full max-w-4xl flex flex-row gap-2 h-12">
          <input
            type="text"
            placeholder="Søk etter fag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="highlight-border-burnt-peach p-4 border-b-2 border-terracotta-clay w-full focus:outline-none"
          />

          {selectedCourses.length > 0 && (
            <button onClick={handleNavigateToCalendar} className="cursor-pointer transition hover:bg-terracotta-clay w-12 h-12 bg-burnt-peach rounded-full p-4 whitespace-nowrap text-bright-white flex flex-row gap-2 justify-center items-center">
              <span className="material-icons">arrow_forward</span>
            </button>
          )}
        </div>

      {loading && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-5 bg-powder-petal animate-pulse"
              style={{ animationDelay: `${i * 0.08}s`, animationDuration: "1s" }}
            >
              <div className="h-4 w-20 bg-rosy-taupe/30 rounded mb-3"></div>
              <div className="h-3 w-full bg-rosy-taupe/20 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Selected courses */}
      {selectedCourses.length > 0 && (
        <div className="w-full flex flex-wrap gap-2 mt-8">
          {selectedCourses.map(course => (
            <span
              key={course.courseid}
              onClick={() => handleToggleCourse(course.courseid)}
              className="whitespace-nowrap truncate rounded-full bg-powder-petal px-4 py-2 text-sm cursor-pointer hover:scale-105 transition duration-200"
            >
              {course.name}
            </span>
          ))}
        </div>
      )}

      {/* Course cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {!loading && filteredCourses
          .filter(c => !selectedCourses.some(s => s.courseid === c.courseid))
          .map(course => (
            <div
              key={course.courseid}
              onClick={() => handleToggleCourse(course.courseid)}
              className="rounded-xl p-5 bg-powder-petal hover:shadow-rosy-taupe hover:scale-105 transition cursor-pointer"
            >
              <p>{course.courseid}</p>
              <p className="text-xs whitespace-nowrap overflow-hidden text-ellipsis">{course.name}</p>
            </div>
          ))}
      </div>

      {!loading && filteredCourses.length === 0 && (
        <p className="text-center text-burnt-peach">Ingen kurs funnet for {semester}</p>
      )}
      </span>

    </div>
  );
}

export default CourseSetupClientPage;