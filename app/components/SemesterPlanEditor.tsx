"use client";
import { useState, useMemo, useEffect } from "react";
import { SemesterPlan } from "../types/SemesterPlan";
import StepDescription from "./StepDescription";
import { getISOWeek } from "date-fns";
import { useSearchParams } from "next/navigation";

interface SemesterPlanEditorProps {
  originalSemesterPlans: SemesterPlan[];
  setEditedSemesterPlans: (plans: SemesterPlan[]) => void;
}

const weekdays = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

function formatWeeks(weeks: number[]): string {
  if (!weeks.length) return "";
  const sorted = [...weeks].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    if (current === end + 1) {
      end = current;
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = current;
      end = current;
    }
  }
  return ranges.join(", ");
}

export default function SemesterPlanEditor({
  originalSemesterPlans,
  setEditedSemesterPlans,
}: SemesterPlanEditorProps) {
  const params = useSearchParams();
  const aliasParam = params.get("alias") || "";

  const groupedByCourse = useMemo(() => {
    const map: Record<
      string,
      Record<
        string,
        {
          summary: string;
          weekday: string;
          start: string;
          end: string;
          weeks: number[];
          formattedWeeks?: string;
          studentgroups: string[];
          coursename: string;
        }
      >
    > = {};

    originalSemesterPlans.forEach((plan) => {
      plan.events.forEach((event) => {
        if (!map[plan.courseid]) map[plan.courseid] = {};

        const cleanDtStart = event.dtstart.replace(/([+-]\d{2})$/, "$1:00");
        const eventWeek = getISOWeek(new Date(cleanDtStart));
        const weekdayName = weekdays[event.weekday - 1];

        const key = `${event.aid}-${weekdayName}`;

        if (!map[plan.courseid][key]) {
          map[plan.courseid][key] = {
            summary: event.summary,
            weekday: weekdayName,
            start: event.dtstart.slice(11, 16),
            end: event.dtend.slice(11, 16),
            weeks: [eventWeek],
            studentgroups: event.studentgroups ?? [],
            coursename: plan.coursename,
          };
        } else {
          map[plan.courseid][key].weeks.push(eventWeek);
          map[plan.courseid][key].studentgroups.push(
            ...(event.studentgroups ?? []),
          );
        }
      });
    });

    for (const course of Object.values(map)) {
      for (const aid of Object.values(course)) {
        aid.formattedWeeks = formatWeeks(Array.from(new Set(aid.weeks)));
        aid.studentgroups = Array.from(new Set(aid.studentgroups));
      }
    }

    return map;
  }, [originalSemesterPlans]);

  const [activeAids, setActiveAids] = useState<
    Record<string, Record<string, boolean>>
  >({});

  useEffect(() => {
    const updateState = () => {
      // Run only on client
      let initialState: Record<
        string,
        Record<string, boolean>
      > = Object.fromEntries(
        Object.entries(groupedByCourse).map(([courseid, aids]) => [
          courseid,
          Object.fromEntries(Object.keys(aids).map((key) => [key, true])),
        ]),
      );

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const stateParam = params.get("state");
        if (stateParam) {
          try {
            initialState = JSON.parse(decodeURIComponent(stateParam));
          } catch (err) {
            console.error("Failed to parse URL state", err);
          }
        }
      }

      setActiveAids(initialState);
    };

    updateState();
  }, [groupedByCourse]);

  useEffect(() => {
    if (!Object.keys(activeAids).length) return; // skip until initialized

    const updatedPlans = originalSemesterPlans.map((plan) => {
      const aids = activeAids[plan.courseid] || {};
      const filteredEvents = plan.events.filter((ev) => {
        const weekdayName = weekdays[ev.weekday - 1];
        const key = `${ev.aid}-${weekdayName}`;
        return aids[key] ?? true;
      });
      return { ...plan, events: filteredEvents };
    });

    setEditedSemesterPlans(updatedPlans);

    // Update URL
    if (typeof window !== "undefined") {
      const encoded = encodeURIComponent(JSON.stringify(activeAids));
      const existingParams = new URLSearchParams(window.location.search);
      existingParams.set("state", encoded);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${existingParams.toString()}`,
      );
    }
  }, [activeAids, originalSemesterPlans, setEditedSemesterPlans]);

  const toggleAid = (courseid: string, key: string) => {
    setActiveAids({
      ...activeAids,
      [courseid]: {
        ...activeAids[courseid],
        [key]: !activeAids[courseid][key],
      },
    });
  };

  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center">
      <StepDescription
        number="2.1"
        title="Rediger semesterplaner"
        description="Trykk på en time for å skjule eller vise den i kalenderen."
      />
      <section className="w-full">
        <h2 className="mb-4">Dine semesterplaner:</h2>
        <div className="flex flex-col gap-12">
          {Object.entries(groupedByCourse).map(([courseid, aids]) => (
            <div key={courseid}>
              <h3 className="text-xl font-semibold font-noto-sans text-deep-dark mb-2">
                {JSON.parse(decodeURIComponent(aliasParam))[courseid]} (
                {courseid}):
              </h3>
              <div className="flex flex-row flex-no-wrap overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(aids).map(([key, evData]) => (
                  <div
                    key={key}
                    className={`relative min-w-[350px] md:min-w-none rounded-xl cursor-pointer transition-all ${
                      activeAids[courseid]?.[key]
                        ? "bg-powder-petal border-powder-petal border"
                        : "opacity-50 bg-powder-petal border-burnt-peach border z-0"
                    }`}
                    onClick={() => toggleAid(courseid, key)}
                  >
                    {!activeAids[courseid]?.[key] && (
                      <div className="absolute top-2 right-2 material-icons px-2 py-1 rounded-full text-xs font-semibold z-10">
                        visibility_off
                      </div>
                    )}
                    <div className="text-sm p-4">
                      <p className="font-semibold flex items-center gap-2 mb-2">
                        <span className="material-icons text-burnt-peach">
                          event_note
                        </span>
                        {evData.summary}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-icons text-burnt-peach">
                          calendar_today
                        </span>
                        Uker: {evData.formattedWeeks}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-icons text-burnt-peach">
                          schedule
                        </span>
                        {evData.weekday} {evData.start}–{evData.end}
                      </div>
                      {evData.studentgroups.length > 0 && (
                        <div className="flex items-center gap-2 whitespace-nowrap truncate">
                          <span className="material-icons text-burnt-peach">
                            groups
                          </span>
                          {evData.studentgroups.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
