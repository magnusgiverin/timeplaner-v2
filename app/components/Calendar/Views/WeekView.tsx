import { Event } from "@/app/types/SemesterPlan";
import DaysColumn from "../DaysColumn";
import TimeColumn from "../TimeColumn";
import { isSameDay, parseISO } from "date-fns";

interface WeekViewProps {
  weekDates: Date[];
  eventItems: Event[];
  hours: number[];
  setSelectedDate: (date: Date) => void;
  setView: (view: "day" | "week" | "month") => void;
}

const WeekView = ({
  weekDates,
  eventItems,
  hours,
  setSelectedDate,
  setView,
}: WeekViewProps) => {
  const renderedEvents = eventItems.filter((ev) =>
    weekDates.some((day) => isSameDay(day, parseISO(ev.dtstart))),
  );

  return (
    <section className="overflow-x-auto bg-powder-petal p-4 rounded-3xl">
      <div className="flex min-w-[700px]">
        <TimeColumn hours={hours} />
        <DaysColumn
          weekDates={weekDates}
          eventItems={renderedEvents}
          hours={hours}
          setSelectedDate={setSelectedDate}
          setView={setView}
        />
      </div>
    </section>
  );
};

export default WeekView;
