import { useRef, useState } from "react";
import WeekView from "./Views/WeekView";
import MonthView from "./Views/MonthView";
import DayView from "./Views/DayView";
import { Event, SemesterPlan } from "@/app/types/SemesterPlan";

const IconButton = ({
  icon,
  onClick,
  ariaLabel,
  selected,
}: {
  icon: string;
  onClick: () => void;
  ariaLabel?: string;
  selected?: boolean;
}) => {
  return (
    <button className={`cursor-pointer  rounded-full items-center flex justify-center p-2 transition  w-10 md:w-12 h-10 md:h-12 ${!selected ? " bg-burnt-peach hover:bg-terracotta-clay" : "hover:bg-burnt-peach bg-rosy-taupe"}`} onClick={onClick} aria-label={ariaLabel}>
      <span className="material-icons">{icon}</span>
    </button>
  )
};

function stringToPastelColor(
  str: string,
  lightness = 85,
  saturation = 40,
  warmShift = 20
) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Hue between 0–360, shifted slightly toward warm tones
  let hue = Math.abs(hash) % 360;
  hue = (hue + warmShift) % 360;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function getEventColorPalette(eventType: string) {
  const primary = stringToPastelColor(eventType, 85, 35, 20);
  const secondary = stringToPastelColor(eventType, 60, 25, 20);
  const hover = stringToPastelColor(eventType, 75, 30, 20);

  const lightnessValue = parseInt(primary.match(/\d+/g)?.[2] ?? "85", 10);
  const textColor = lightnessValue > 70 ? "#222" : "#fff";
  const locationColor = lightnessValue > 70 ? "#555" : "#ddd";

  return { primary, secondary, hover, textColor, locationColor };
}

export const getColorForEvent = (event: Event) => {
  return getEventColorPalette(event.courseid);
};

export function getWeekDates(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

interface CalendarDisplayProps {
  semesterPlans: SemesterPlan[];
}

const CalendarDisplay = ({
  semesterPlans,
}: CalendarDisplayProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const previousViewRef = useRef<"day" | "week" | "month" | null>(null);

  const weekDates = getWeekDates(selectedDate);

  function handleNext() {
    const next = new Date(selectedDate);

    if (view === "day") {
      next.setDate(next.getDate() + 1);
    } else if (view === "week") {
      // Move one week forward
      next.setDate(next.getDate() + 7);
    } else if (view === "month") {
      // Move one month forward
      next.setMonth(next.getMonth() + 1);
    }

    if (view === "day") {
      const currentDay = selectedDate.getDay();
      const nextDate = new Date(selectedDate);

      if (currentDay === 5) {
        // Friday -> add 3 days to jump to Monday
        nextDate.setDate(selectedDate.getDate() + 3);
      } else {
        // Otherwise, just go to next day
        nextDate.setDate(selectedDate.getDate() + 1);
      }

      setSelectedDate(nextDate);
    } else {
      setSelectedDate(next);
    }
  }

  function handlePrev() {
    const prev = new Date(selectedDate);

    if (view === "day") {
      // Move one day back
      prev.setDate(prev.getDate() - 1)
    } else if (view === "week") {
      // Move one week back
      prev.setDate(prev.getDate() - 7);
    } else if (view === "month") {
      // Move one month back
      prev.setMonth(prev.getMonth() - 1);
    }

    if (view === "day") {
      const currentDay = selectedDate.getDay();
      const nextDate = new Date(selectedDate);

      if (currentDay === 1) {
        // Monday -> subtract 3 days to jump to Friday
        nextDate.setDate(selectedDate.getDate() - 3);
      } else {
        // Otherwise, just go to next day
        nextDate.setDate(selectedDate.getDate() - 1);
      }

      setSelectedDate(nextDate);
    } else {
      setSelectedDate(prev);
    }
  }

  const handleViewChange = (newView: "day" | "week" | "month") => {
    previousViewRef.current = view;
    setView(newView);
  }

  const hours = Array.from({ length: expanded ? 25 : 11 }, (_, i) => i);

  function getISOWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    // Set to nearest Thursday: current date + 4 - current day number
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
  }

  const weekStart = weekDates[0] ?? selectedDate;
  const weekNumber = getISOWeekNumber(weekStart);

  const eventItems = semesterPlans.map(sp => sp.events).flat();

  return (
    <main className="w-full">
      <section className="md:hidden mb-4">
        <span className="flex flex-row justify-between">
          <IconButton
            icon="arrow_back"
            onClick={handlePrev}
            ariaLabel="Previous"
          />
          <IconButton
            icon="arrow_forward"
            onClick={handleNext}
            ariaLabel="Next"
          />
          <IconButton
            icon="event"
            onClick={() => setSelectedDate(new Date())}
            ariaLabel="Go to today"
          />
          {view !== "month" && (
            <IconButton
              icon={expanded ? "unfold_less" : "unfold_more"}
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? "Collapse calendar hours" : "Expand calendar hours"}
            />
          )}
          <IconButton
            icon="view_day"
            selected={view === "day"}
            onClick={() => handleViewChange("day")}
            aria-label="Change view"
          />
          <IconButton
            icon="view_week"
            selected={view === "week"}
            onClick={() => handleViewChange("week")}
            aria-label="Change view"
          />
          <IconButton
            icon="view_module"
            selected={view === "month"}
            onClick={() => handleViewChange("month")}
            aria-label="Change view"
          />
        </span>
      </section>
      <section className="hidden mb-4 md:flex flex-col gap-4 md:flex-row md:items-center justify-between bg-powder-petal px-4 rounded-3xl">
        <span className="flex flex-row items-center gap-4">
          <span className="flex flex-row gap-2">
            <IconButton
              icon="arrow_back"
              onClick={handlePrev}
              ariaLabel="Previous"
            />
            <IconButton
              icon="arrow_forward"
              onClick={handleNext}
              ariaLabel="Next"
            />
            <IconButton
              icon="event"
              onClick={() => setSelectedDate(new Date())}
              ariaLabel="Go to today"
            />
          </span>
          <h3>
            {view === "week"
              ? `Week ${weekNumber}`
              : view === "day"
                ? selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
                : selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
          </h3>
        </span>
        <span className="flex flex-row gap-2">
          {view !== "month" && (
            <IconButton
              icon={expanded ? "unfold_less" : "unfold_more"}
              selected={expanded}
              onClick={() => setExpanded((prev) => !prev)}
              aria-label={expanded ? "Collapse calendar hours" : "Expand calendar hours"}
            />
          )}
          <IconButton
            icon="view_day"
            onClick={() => handleViewChange("day")}
            selected={view === "day"}
            aria-label="Change view"
          />
          <IconButton
            icon="view_week"
            onClick={() => handleViewChange("week")}
            selected={view === "week"}
            aria-label="Change view"
          />
          <IconButton
            icon="view_module"
            onClick={() => handleViewChange("month")}
            selected={view === "month"}
            aria-label="Change view"
          />
        </span>
      </section>
      {view === "week" ? (
        <WeekView
          weekDates={weekDates}
          eventItems={eventItems}
          hours={hours}
          expanded={expanded}
          setSelectedDate={setSelectedDate}
          setView={setView}
        />
      ) : view === "day" ? (
        <DayView
          eventItems={eventItems}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          hours={hours}
          setView={setView}
          expanded={expanded}
        />
      ) : (
        <MonthView
          eventItems={eventItems}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          setView={setView}
        />
      )}
    </main>
  );
};

export default CalendarDisplay;
