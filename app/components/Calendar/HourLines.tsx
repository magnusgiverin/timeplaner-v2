interface HourLinesProps {
  hours: number[];
}

const HourLines = ({ hours }: HourLinesProps) => (
  <>
    {hours.map((h: number, i: number) => (
      <div
        key={h}
        className="absolute left-0 right-0 border-t border-seashell"
        style={{ top: i * 48, zIndex: 1 }}
      />
    ))}
  </>
);

export default HourLines;
