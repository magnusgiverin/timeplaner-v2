import TimeColumn from "../TimeColumn";
import DaysColumn from "../DaysColumn";
import { Event } from "@/app/types/SemesterPlan";

interface DayViewProps {
    eventItems: Event[];
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    setView: (view: "day" | "week" | "month") => void;
    expanded: boolean;
    hours: number[];
}

const DayView = ({
    eventItems,
    selectedDate,
    setSelectedDate,
    setView,
    expanded,
    hours,
}: DayViewProps) => {

    return (
        <section className="overflow-x-auto bg-powder-petal p-4 rounded-3xl">
            <div className="flex min-w-[700px]">
                <TimeColumn hours={hours} expanded={expanded} />
                <DaysColumn
                    weekDates={[selectedDate]}
                    eventItems={eventItems}
                    hours={hours}
                    expanded={expanded}
                    setSelectedDate={setSelectedDate}
                    setView={setView}
                />
            </div>
        </section>
    );
};

export default DayView;