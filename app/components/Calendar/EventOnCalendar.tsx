import { useEffect, useState } from "react";
import { getColorForEvent } from "./CalendarDisplay";
import { Event } from "@/app/types/SemesterPlan";
import EventModal from "./EventModal";

type EventOnCalendarProps = {
  eventData: {
    event: Event;
    width: number;
    left: number;
  };
  expanded: boolean;
};

const HOUR_HEIGHT = 32;

function parseEventHour(dt: string) {
  // dt = "2025-08-18T08:00:00+02"
  const [datePart, timePart] = dt.split("T");
  const [hoursStr, minutesStr] = timePart.split(":");
  return parseInt(hoursStr, 10) + parseInt(minutesStr, 10) / 60;
}


export const EventOnCalendar = ({ eventData, expanded }: EventOnCalendarProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const event = eventData.event;
  const DAY_START_HOUR = expanded ? 0 : 8;

  const startHour = parseEventHour(event.dtstart);
  const endHour = parseEventHour(event.dtend);

  // Skip events ending before visible window
  if (!expanded && endHour <= DAY_START_HOUR) return null;

  const clippedStartHour = Math.max(startHour, DAY_START_HOUR);
  const top = (clippedStartHour - DAY_START_HOUR) * HOUR_HEIGHT;
  const height = (endHour - clippedStartHour) * HOUR_HEIGHT;

  const colorPalette = getColorForEvent(event);

  return (
    <>
      <div
        className="absolute cursor-pointer rounded border border-l-4 px-1 transition-colors duration-300"
        title={event.courseid}
        style={{
          top,
          height: `${height}px`,
          width: `${eventData.width}%`,
          left: `${eventData.left}%`,
          zIndex: 2,
          backgroundColor: colorPalette.primary,
          borderColor: colorPalette.secondary,
          paddingTop: height < 24 ? "0px" : "2px",
          paddingBottom: height < 24 ? "0px" : "2px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colorPalette.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colorPalette.primary)}
        onClick={() => setModalOpen(true)}
      >
        <span
          className="block truncate"
          style={{ color: colorPalette.textColor, fontSize: height < 25 ? "0.3rem" : "0.9rem" }}
        >
          {event.courseid}
        </span>
        {height >= 40 && event.room && (
          <span className="flex items-center gap-1 truncate" style={{ color: colorPalette.locationColor, fontSize: "0.7rem" }}>
            <span className="material-icons" style={{ fontSize: "inherit" }}>location_on</span>
            {event.room.map((r) => r.roomid).join(", ")}
          </span>
        )}
      </div>
      {modalOpen && (
        <EventModal event={event} setModalOpen={setModalOpen} />
      )}
    </>
  );
};