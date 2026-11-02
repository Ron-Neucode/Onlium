import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { apiService } from "../services/apiService.js";
import "./styles/AdminSchoolCalendar.css";

const EVENT_TYPES = [
  { value: "Enrollment", label: "Enrollment", color: "#2563eb" },
  { value: "Holiday", label: "Holiday", color: "#16a34a" },
  { value: "SchoolEvent", label: "School Event", color: "#7c3aed" },
];

const formatTime = (timeString) => {
  if (!timeString) return "";
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  return date.toLocaleString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export default function AdminSchoolCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSection, setSelectedSection] = useState("all");
  const [sections, setSections] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Enrollment",
    isAllDay: true,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    loadSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      loadEvents();
    }
  }, [selectedSection]);

  const loadSections = async () => {
    try {
      const data = await apiService.getSchoolCalendarSections();
      setSections(data);
    } catch (err) {
      setError(err.message || "Failed to load sections");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const sectionId = selectedSection === "all" ? null : selectedSection;
      const data = await apiService.getSchoolCalendarEvents(sectionId);
      setEvents(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load events");
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      eventType: "Enrollment",
      isAllDay: true,
      startTime: "",
      endTime: "",
    });
    setShowModal(true);
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      eventType: event.eventType,
      isAllDay: event.isAllDay,
      startTime: event.startTime ? event.startTime.slice(0, 5) : "",
      endTime: event.endTime ? event.endTime.slice(0, 5) : "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const sectionId = selectedSection === "all" ? null : selectedSection;
      const eventData = {
        sectionId: sectionId,
        title: formData.title,
        description: formData.description,
        eventDate: selectedDate,
        eventType: formData.eventType,
        isAllDay: formData.isAllDay,
        startTime: !formData.isAllDay && formData.startTime ? new Date(`2000-01-01T${formData.startTime}`) : null,
        endTime: !formData.isAllDay && formData.endTime ? new Date(`2000-01-01T${formData.endTime}`) : null,
      };

      if (editingEvent) {
        await apiService.updateSchoolCalendarEvent(editingEvent.id, eventData);
        setSuccessMessage("Event updated successfully!");
      } else {
        await apiService.createSchoolCalendarEvent(eventData);
        setSuccessMessage("Event created successfully!");
      }

      setShowModal(false);
      loadEvents();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    if (!confirm("Are you sure you want to delete this event?")) return;

    setSubmitting(true);
    try {
      await apiService.deleteSchoolCalendarEvent(editingEvent.id);
      setSuccessMessage("Event deleted successfully!");
      setShowModal(false);
      loadEvents();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setSubmitting(false);
    }
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.eventDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
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

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  return (
    <div className="admin-school-calendar">
      <div className="calendar-header">
        <h1>School Calendar</h1>
        <div className="calendar-controls">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="section-select"
          >
            <option value="all">All Sections (Public)</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.sectionCode} - {section.programCode} Year {section.yearLevel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="calendar-container">
        <div className="calendar-wrapper">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            onClickDay={handleDateClick}
            tileContent={tileContent}
            className="custom-calendar"
          />
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
                    onClick={() => handleEventClick(event)}
                    style={{ borderLeftColor: eventType?.color || "#2563eb" }}
                  >
                    <div className="event-type">{eventType?.label || event.eventType}</div>
                    <div className="event-title">{event.title}</div>
                    {event.description && <div className="event-description">{event.description}</div>}
                    {event.sectionCode && <div className="event-section">Section: {event.sectionCode}</div>}
                    {!event.isAllDay && event.startTime && (
                      <div className="event-time">
                        {event.startTime.slice(0, 5)} - {event.endTime?.slice(0, 5)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingEvent ? "Edit Event" : "Add Event"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  required
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Event title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event description (optional)"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAllDay}
                    onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                  />
                  All day event
                </label>
              </div>

              {!formData.isAllDay && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required={!formData.isAllDay}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required={!formData.isAllDay}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => !submitting && setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                {editingEvent && (
                  <button type="button" onClick={handleDelete} disabled={submitting} className="delete-button">
                    Delete
                  </button>
                )}
                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : editingEvent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
