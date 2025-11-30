import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { getColorForEvent } from "../CalendarDisplay";
import { Event } from "@/app/types/SemesterPlan";

interface MonthViewProps {
    eventItems: Event[];
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    setView: (view: "day" | "week" | "month") => void;
}

function parseDateWithTZ(dt: string) {
    // If the string ends with "+HH", add ":00" to make it "+HH:00"
    return new Date(dt.replace(/([+-]\d{2})$/, "$1:00"));
}

const MonthView = ({
    eventItems,
    selectedDate,
    setSelectedDate,
    setView,
}: MonthViewProps) => {
    // Compute start and end of the month
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    // Compute the first Monday before (or equal to) start, and last Sunday after end
    const calendarStart = startOfWeek(start, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(end, { weekStartsOn: 1 });

    // Generate all visible days in the grid
    const days: Date[] = [];
    let current = calendarStart;
    while (current <= calendarEnd) {
        days.push(current);
        current = addDays(current, 1);
    }

    // Group into weeks (arrays of 7 days)
    const weeks: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <section className="overflow-x-auto w-full">
            <div className="grid grid-cols-7 border border-powder-petal rounded-lg overflow-hidden">
                {/* Weekday headers */}
                {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => (
                    <div
                        key={day}
                        className="p-2 text-center font-semibold bg-terracotta-clay text-deep-dark"
                    >
                        {day}
                    </div>
                ))}

                {/* Days grid */}
                {weeks.map((week, wIdx) =>
                    week.map((day, dIdx) => {
                        const isCurrentMonth = day.getMonth() === selectedDate.getMonth();

                        const dayEvents = eventItems.filter(ev => {
                            const evDate = parseDateWithTZ(ev.dtstart);
                            return (
                                evDate.getFullYear() === day.getFullYear() &&
                                evDate.getMonth() === day.getMonth() &&
                                evDate.getDate() === day.getDate()
                            );
                        });

                        return (
                            <div
                                key={`${wIdx}-${dIdx}`}
                                className={`cursor-pointer relative h-32 border-b border-r border-seashell p-2 text-sm transition-all ${isCurrentMonth
                                    ? "hover:bg-seashell "
                                    : "bg-rosy-taupe hover:bg-seashell"
                                    }`}
                                onClick={() => {
                                    setSelectedDate(startOfWeek(day, { weekStartsOn: 1 }));
                                    setView("week");
                                }}
                            >
                                {/* Day number */}
                                <div className="font-semibold text-gray-700 items-center flex">
                                    {day.toDateString() === new Date().toDateString() && (
                                        <span
                                            className="inline-block h-2 w-2 mr-2 rounded-full bg-berryBlast"
                                            title="Today"
                                        />
                                    )}
                                    {day.getDate()}
                                </div>

                                {/* Events preview */}
                                <div className="mt-1 space-y-1 overflow-hidden">
                                    {dayEvents.slice(0, 3).map((ev) => (
                                        <div
                                            key={ev.actid + ev.dtstart}
                                            className="truncate rounded-md px-1 text-xs"
                                            style={{
                                                backgroundColor: getColorForEvent(ev).primary,
                                                color: getColorForEvent(ev).textColor,
                                            }}
                                        >
                                            {ev.courseid}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-xs text-slate">
                                            +{dayEvents.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

export default MonthView;