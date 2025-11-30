import CurrentTimeLine from "./CurrentTimeLine";
import HourLines from "./HourLines";
import { EventOnCalendar } from "./EventOnCalendar";
import { Event } from "@/app/types/SemesterPlan";
import { parseISO, isSameDay } from "date-fns";

const weekdays = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
];

interface DaysColumnProps {
  weekDates: Date[];
  eventItems: Event[];
  hours: number[];
  expanded: boolean;
  setSelectedDate: (date: Date) => void;
  setView: (view: "day" | "week" | "month") => void;
}

interface PositionedEvent {
  event: Event;
  width: number;
  left: number;
}

const DaysColumn = ({
  weekDates,
  eventItems,
  hours,
  expanded,
  setSelectedDate,
  setView, 
}: DaysColumnProps) => {

function eventsForDay(day: Date) {
  return eventItems.filter((ev) => isSameDay(parseISO(ev.dtstart), day));
}

  // Assign overlapping events to columns
  function positionEvents(events: Event[]): PositionedEvent[] {
  if (!events.length) return [];

  // Sort events by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.dtstart).getTime() - new Date(b.dtstart).getTime()
  );

  const positioned: PositionedEvent[] = [];

  type Column = { event: Event; colIndex: number };
  let activeColumns: Column[] = [];

  sorted.forEach((ev) => {
    const evStart = new Date(ev.dtstart).getTime();

    activeColumns = activeColumns.filter(
      (c) => new Date(c.event.dtend).getTime() > evStart
    );

    let colIndex = 0;
    const usedIndices = activeColumns.map((c) => c.colIndex);
    while (usedIndices.includes(colIndex)) colIndex++;

    activeColumns.push({ event: ev, colIndex });

    const totalColumns = activeColumns.length;
    const width = totalColumns === 1 ? 100 : 100 / totalColumns;

    positioned.push({
      event: ev,
      width,
      left: width * colIndex,
    });
  });

  return positioned;
}


  return (
    <span className="flex w-full flex-row">
      {weekDates.map((day, idx) => {
        const dayEvents = eventsForDay(day);
        const positionedEvents = positionEvents(dayEvents);

        return (
          <div
            key={idx}
            className="relative min-h-[120px] min-w-[120px] flex-1 border-r border-terracotta-clay p-2 last:rounded-r-lg last:border-r-0"
          >
            <span className="cursor-pointer mb-1 flex items-center gap-1 font-bold"
              onClick={() => {
                setSelectedDate(day);
                setView("day");
              }}
            >
              {day.toDateString() === new Date().toDateString() && (
                <span
                  className="inline-block h-2 w-2 rounded-full bg-deep-dark"
                  title="Today"
                />
              )}
              {weekdays[day.getDay() === 0 ? 6 : day.getDay() - 1]}
            </span>
            <div className="mb-2 text-sm text-deep-dark">
              {day.toLocaleDateString("nb-NO", { timeZone: "Europe/Oslo" })}
            </div>

            {/* Time slots */}
            <div
              className="relative"
              style={{ height: `${hours.length * 48}px` }}
            >
              {positionedEvents.map((ev, idx) => (
                <EventOnCalendar
                  key={ev.event.actid + idx}
                  eventData={ev}
                  expanded={expanded}
                />
              ))}
              <HourLines hours={hours} />
              <CurrentTimeLine day={day} expanded={expanded} />
            </div>
          </div>
        );
      })}
    </span>
  );
};

export default DaysColumn;
