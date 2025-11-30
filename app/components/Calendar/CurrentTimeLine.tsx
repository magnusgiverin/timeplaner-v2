interface CurrentTimeLineProps {
  day: Date;
  expanded: boolean;
}

const CurrentTimeLine = ({ day, expanded }: CurrentTimeLineProps) => {
  const startHour = expanded ? 0 : 8; 

  let nowLine: number | null = null;
  if (day.toDateString() === new Date().toDateString()) {
    const now = new Date();
    nowLine = (now.getHours() - startHour + now.getMinutes() / 60) * 32;
  }

  return (
    nowLine !== null && (
      <div
        className="absolute left-0 right-0 flex h-0.5 items-center rounded-full bg-burnt-peach"
        style={{ top: nowLine, zIndex: 2 }}
        title="Current time"
      >
        <span className="absolute left-2 rounded bg-burnt-peach px-2 py-0.5 text-xs text-bright-white">
          now
        </span>
      </div>
    )
  );
};

export default CurrentTimeLine;
