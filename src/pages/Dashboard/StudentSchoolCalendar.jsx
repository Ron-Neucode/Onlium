import { useState, useEffect, useCallback } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { apiService } from "../../services/apiService.js";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./StudentSchoolCalendar.css";

const EVENT_TYPES = [
  { value: "Enrollment", label: "Enrollment", color: "#2563eb" },
  { value: "Holiday", label: "Holiday", color: "#16a34a" },
  { value: "SchoolEvent", label: "School Event", color: "#7c3aed" },
  { value: "ClassAnnouncement", label: "Class Announcement", color: "#ea580c" },
];

export default function StudentSchoolCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Calendar");

  const loadEvents = useCallback(async () => {
    try {
      const data = await apiService.getSchoolCalendarEvents(null);
      setEvents(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect starts the calendar's asynchronous initial data request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEvents();
  }, [loadEvents]);

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      const selectedDateLocal = new Date(date);
      return (
        eventDate.getDate() === selectedDateLocal.getDate() &&
        eventDate.getMonth() === selectedDateLocal.getMonth() &&
        eventDate.getFullYear() === selectedDateLocal.getFullYear()
      );
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="calendar-tile-events">
        {dayEvents.slice(0, 2).map((event) => {
          const eventType = EVENT_TYPES.find((t) => t.value === event.eventType);
          return (
            <div
              key={event.id}
              className="calendar-event-dot"
              style={{ backgroundColor: eventType?.color || "#2563eb" }}
              title={event.title}
            />
          );
        })}
        {dayEvents.length > 2 && <span className="calendar-event-more">+{dayEvents.length - 2}</span>}
      </div>
    );
  };

  return (
    <div className="portal">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="main">
        <Topbar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="content">
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Loading...
            </div>
          ) : error ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
              {error}
            </div>
          ) : (
            <div className="calendar-layout">
              <div className="calendar-main">
                <div className="calendar-wrapper">
                  <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                    className="custom-calendar"
                  />
                </div>
                <div className="calendar-legend">
                  <h4>Event Types</h4>
                  <div className="legend-items">
                    {EVENT_TYPES.map((type) => (
                      <div key={type.value} className="legend-item">
                        <span
                          className="legend-dot"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="events-sidebar">
                <h3>Events for {selectedDate.toLocaleDateString()}</h3>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="no-events">No events for this date</p>
                ) : (
                  <div className="events-list">
                    {getEventsForDate(selectedDate).map((event) => {
                      const eventType = EVENT_TYPES.find((t) => t.value === event.eventType);
                      return (
                        <div
                          key={event.id}
                          className="event-card"
                          style={{ borderLeftColor: eventType?.color || "#2563eb" }}
                        >
                          <div className="event-type">{eventType?.label || event.eventType}</div>
                          <div className="event-title">{event.title}</div>
                          {event.description && <div className="event-description">{event.description}</div>}
                          {event.sectionCode && <div className="event-section">Section: {event.sectionCode}</div>}
                          {event.subjectCode && <div className="event-section">Class: {event.subjectCode}{event.subjectTitle ? ` · ${event.subjectTitle}` : ""}</div>}
                          {!event.isAllDay && event.startTime && (
                            <div className="event-time">
                              {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
