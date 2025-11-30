interface TimeColumnProps {
  hours: number[];
}

const TimeColumn = ({ hours }: TimeColumnProps) => (
  <div className="flex min-h-[120px] w-[60px] min-w-[60px] flex-col gap-[18px] rounded-l-lg border-r border-terracotta-clay p-2">
    <span className="font-bold">Time</span>
    <div className="flex flex-col">
      {hours.map((h) => (
        <div key={h} className="flex h-12 items-center justify-center text-xs">
          {`${(h + 8).toString().padStart(2, "0")}:00`}
        </div>
      ))}
    </div>
  </div>
);

export default TimeColumn;
