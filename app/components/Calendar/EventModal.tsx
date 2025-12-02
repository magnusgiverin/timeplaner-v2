import { Event } from "@/app/types/SemesterPlan";
import { parseEventHour } from "./CalendarDisplay";

interface EventModalProps {
  event: Event;
  setModalOpen: (open: boolean) => void;
}

const EventModal = ({ event, setModalOpen }: EventModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
      <div className="p-4 rounded-xl bg-powder-petal min-w-[300px] md:min-w-[400px] max-w-xl flex flex-col gap-2">
        {/* Header: course + close button */}
        <div className="flex justify-between items-top mb-2 ">
          <h3 className="font-semibold">{event.courseid}</h3>
          <button
            className="cursor-pointer bg-burnt-peach rounded-full flex items-center justify-center p-2 w-12 h-12 transition hover:bg-terracotta-clay"
            onClick={() => setModalOpen(false)}
            aria-label="Close modal"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      <span className="flex flex-col gap-2 p-2">
        {/* Basic timing */}
        <div className="flex items-center gap-2">
          <span className="material-icons text-burnt-peach">schedule</span>
          <p>
            {String(parseEventHour(event.dtstart)).replace(".", ":")} – {String(parseEventHour(event.dtend)).replace(".", ":")}
          </p>
        </div>

        {/* Week number */}
        <div className="flex items-center gap-2">
          <span className="material-icons text-burnt-peach">
            calendar_today
          </span>
          <p>Uke: {event.weeknr}</p>
        </div>

        {/* Weekday */}
        <div className="flex items-center gap-2">
          <span className="material-icons text-burnt-peach">today</span>
          <p>Dag: {["Man", "Tir", "Ons", "Tor", "Fre"][event.weekday - 1]}</p>
        </div>

        {/* Semester info */}
        <div className="flex items-center gap-2">
          <span className="material-icons text-burnt-peach">school</span>
          <p>Semester: {event.semesterid}</p>
        </div>

        {/* Staffs */}
        {event.staffNames?.length || event.staffs?.length ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-icons text-burnt-peach">people</span>
            <p>
              Personale:{" "}
              {event.staffNames?.join(", ") ||
                event.staffs
                  ?.map((s) => `${s.firstname} ${s.lastname}`)
                  .join(", ")}
            </p>
          </div>
        ) : null}

        {/* Type and compulsory */}
        <div className="flex items-center gap-2">
          <span className="material-icons text-burnt-peach">category</span>
          <p>
            Type: {event["teaching-method-name"]} • {event.coursetype} •{" "}
            {event.compulsory ? "Obligatorisk" : "Valgfritt"}
          </p>
        </div>

        {/* Student groups */}
        {event.studentgroups?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-icons text-burnt-peach">groups</span>
            <p>For: {event.studentgroups.join(", ")}</p>
          </div>
        )}

        {/* Room info */}
        {event.room && event.room.length > 0 && (
          <div className="flex flex-row gap-1">
            <span className="material-icons text-burnt-peach">location_on</span>
            {event.room.map((r) => (
              <p key={r.id} className="truncate">
                {r.roomname} ({r.roomid}) - {r.buildingname} (
                {r.buildingacronym}){r.videolink ? " • Has Video" : ""} •
                Campus: {r.campusid}
              </p>
            ))}
          </div>
        )}
      </span>
      </div>
    </div>
  );
};

export default EventModal;
