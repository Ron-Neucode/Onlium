import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/apiService.js";

const PROGRAMS = [
  ["BSIT", "BS Information Technology"],
  ["BSCS", "BS Computer Science"],
  ["BSBA", "BS Business Administration"],
  ["BSHM", "BS Hospitality Management"],
  ["BSA", "BS Accountancy"],
];
const YEARS = [1, 2, 3, 4];
const SEMESTERS = [
  [1, "1st Semester"],
  [2, "2nd Semester"],
  [3, "Summer"],
];
const WEEKDAYS = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
];

const inputStyle = {
  boxSizing: "border-box",
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  padding: "9px 10px",
  color: "#1e293b",
  background: "#fff",
};

function termLabel(section) {
  const year = section.yearLevel === 1 ? "1st" : section.yearLevel === 2 ? "2nd" : section.yearLevel === 3 ? "3rd" : `${section.yearLevel}th`;
  const semester = section.semester === 3 ? "Summer" : `${section.semester === 1 ? "1st" : "2nd"} Semester`;
  return `${section.programCode} · ${year} Year · ${semester}`;
}

function timeValue(value) {
  return value ? String(value).slice(0, 5) : "";
}

function selectedWeekdays(value) {
  const aliases = {
    M: "Mon", MON: "Mon", MONDAY: "Mon",
    T: "Tue", TU: "Tue", TUE: "Tue", TUESDAY: "Tue",
    W: "Wed", WE: "Wed", WED: "Wed", WEDNESDAY: "Wed",
    TH: "Thu", R: "Thu", THU: "Thu", THURSDAY: "Thu",
    F: "Fri", FR: "Fri", FRI: "Fri", FRIDAY: "Fri",
    SA: "Sat", SAT: "Sat", SATURDAY: "Sat",
  };
  const days = new Set();
  const normalized = String(value || "").trim().toUpperCase();
  const tokens = normalized.split(/[,;/|\s]+/).filter(Boolean);

  if (tokens.length > 1 || aliases[normalized]) {
    tokens.forEach(token => {
      if (aliases[token]) days.add(aliases[token]);
    });
  } else {
    for (let index = 0; index < normalized.length; index += 1) {
      if (normalized.slice(index, index + 2) === "TH") {
        days.add("Thu");
        index += 1;
      } else if (aliases[normalized[index]]) {
        days.add(aliases[normalized[index]]);
      }
    }
  }

  return WEEKDAYS.map(([code]) => code).filter(day => days.has(day));
}

function emptySchedule() {
  return {
    instructorId: "",
    days: "",
    startTime: "",
    endTime: "",
    classroomId: "",
  };
}

export default function SectionManagement() {
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [unassignedEnrollments, setUnassignedEnrollments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [savingStudyLoadId, setSavingStudyLoadId] = useState("");
  const [assigningApplicationId, setAssigningApplicationId] = useState("");
  const [assignmentSectionIds, setAssignmentSectionIds] = useState({});
  const [scheduleForms, setScheduleForms] = useState({});
  const [sectionSettings, setSectionSettings] = useState({ capacity: 50, isActive: true });
  const [newSection, setNewSection] = useState({
    programCode: "BSIT",
    yearLevel: 1,
    semester: 1,
    sectionCode: "",
    capacity: 50,
  });

  const loadData = useCallback(async () => {
    setError("");
    try {
      const [sectionData, courseData, unassignedData, roomData, instructorData] = await Promise.all([
        apiService.getAdminAcademicSections(),
        apiService.getStudyLoads(),
        apiService.getAdminUnassignedEnrollments(),
        apiService.getAdminAcademicRooms(),
        apiService.getAdminInstructors(),
      ]);
      setSections(sectionData);
      setCourses(courseData);
      setUnassignedEnrollments(unassignedData);
      setRooms(roomData);
      setInstructors(instructorData.filter(instructor => instructor.status === "Active"));
      setSelectedId(current => sectionData.some(section => section.id === current)
        ? current
        : sectionData[0]?.id || "");
    } catch (requestError) {
      setError(requestError.message || "Unable to load section data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedSection = sections.find(section => section.id === selectedId) || null;
  const activeRooms = rooms.filter(room => room.isActive);
  const sectionCourses = useMemo(() => selectedSection
    ? courses.filter(course =>
      course.programCode === selectedSection.programCode &&
      course.yearLevel === selectedSection.yearLevel &&
      course.semester === selectedSection.semester)
    : [], [courses, selectedSection]);
  const existingSchedules = useMemo(() => Object.fromEntries(
    (selectedSection?.studyLoads || []).map(item => [item.studyLoadId, {
      instructorId: item.instructorId || "",
      days: selectedWeekdays(item.days).join(","),
      startTime: timeValue(item.startTime),
      endTime: timeValue(item.endTime),
      classroomId: item.classroomId || "",
    }]),
  ), [selectedSection]);

  useEffect(() => {
    setScheduleForms(existingSchedules);
    if (selectedSection) {
      setSectionSettings({
        capacity: selectedSection.capacity,
        isActive: selectedSection.isActive,
      });
    }
  }, [existingSchedules, selectedSection]);

  async function handleCreateSection(event) {
    event.preventDefault();
    setCreateError("");
    setNotice("");
    setCreating(true);
    try {
      const created = await apiService.createAcademicSection({
        ...newSection,
        capacity: Number(newSection.capacity),
      });
      setNotice(`Section ${created.sectionCode} created. Add its schedule for every curriculum subject before students can be assigned to it.`);
      setSelectedId(created.id);
      setNewSection(current => ({ ...current, sectionCode: "" }));
      setLoading(true);
      await loadData();
      setSelectedId(created.id);
    } catch (requestError) {
      setCreateError(requestError.message || "Unable to create the section.");
    } finally {
      setCreating(false);
    }
  }

  async function saveSectionSettings() {
    if (!selectedSection) return;
    setError("");
    setSavingSection(true);
    try {
      await apiService.updateAcademicSection(selectedSection.id, {
        capacity: Number(sectionSettings.capacity),
        isActive: sectionSettings.isActive,
      });
      setNotice(`Section ${selectedSection.sectionCode} settings saved.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Unable to save section settings.");
    } finally {
      setSavingSection(false);
    }
  }

  function updateSchedule(studyLoadId, field, value) {
    setScheduleForms(current => ({
      ...current,
      [studyLoadId]: {
        ...(current[studyLoadId] || existingSchedules[studyLoadId] || emptySchedule()),
        [field]: value,
      },
    }));
  }

  async function saveSchedule(course) {
    if (!selectedSection) return;
    setError("");
    const form = scheduleForms[course.id] || existingSchedules[course.id] || emptySchedule();
    if ([form.instructorId, form.days, form.startTime, form.endTime, form.classroomId]
      .some(value => !String(value || "").trim())) {
      setError("Choose an approved instructor and registered classroom, and enter days and start/end times for every subject.");
      return;
    }

    setNotice("");
    setSavingStudyLoadId(course.id);
    try {
      await apiService.updateSectionStudyLoad(selectedSection.id, course.id, form);
      setNotice(`${course.subjectCode} schedule saved for section ${selectedSection.sectionCode}.`);
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Unable to save the subject schedule.");
    } finally {
      setSavingStudyLoadId("");
    }
  }

  async function assignExistingEnrollment(application) {
    const eligibleSections = sections.filter(section =>
      section.isActive &&
      section.scheduleComplete &&
      section.availableSeats > 0 &&
      section.programCode === application.programCode &&
      section.yearLevel === application.yearLevel &&
      section.semester === application.semester);
    const sectionId = assignmentSectionIds[application.applicationId] || eligibleSections[0]?.id;

    if (!sectionId) {
      setError("Create or complete an active section with available capacity for this student's term.");
      return;
    }

    setAssigningApplicationId(application.applicationId);
    setError("");
    try {
      const result = await apiService.assignExistingEnrollmentToSection(sectionId, application.applicationId);
      setNotice(result.message || "Student assigned to a section.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message || "Unable to assign the student to a section.");
    } finally {
      setAssigningApplicationId("");
    }
  }

  return (
    <main style={{ padding: 28, maxWidth: 1400, margin: "0 auto", color: "#1e293b" }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Sections & Class Schedules</h1>
        <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
          Assign an approved instructor, recurring Monday–Saturday class days, time, and registered room to each subject. Only admins can manage these schedules; instructors see their assigned classes in their own portal.
        </p>
      </header>

      {notice && (
        <div role="status" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 9, padding: 12, marginBottom: 14 }}>
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: 9, padding: 12, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <p role="status" style={{ color: "#64748b" }}>Loading sections and curriculum…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
          <aside style={{ display: "grid", gap: 16 }}>
            <form onSubmit={handleCreateSection} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 17 }}>Create a section</h2>
              <label style={{ display: "grid", gap: 5, marginBottom: 11, fontSize: 12, fontWeight: 700 }}>
                Program
                <select style={inputStyle} value={newSection.programCode} onChange={event => setNewSection(current => ({ ...current, programCode: event.target.value }))}>
                  {PROGRAMS.map(([code, label]) => <option key={code} value={code}>{code} — {label}</option>)}
                </select>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ display: "grid", gap: 5, marginBottom: 11, fontSize: 12, fontWeight: 700 }}>
                  Year
                  <select style={inputStyle} value={newSection.yearLevel} onChange={event => setNewSection(current => ({ ...current, yearLevel: Number(event.target.value) }))}>
                    {YEARS.map(year => <option key={year} value={year}>Year {year}</option>)}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 5, marginBottom: 11, fontSize: 12, fontWeight: 700 }}>
                  Semester
                  <select style={inputStyle} value={newSection.semester} onChange={event => setNewSection(current => ({ ...current, semester: Number(event.target.value) }))}>
                    {SEMESTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
              <label style={{ display: "grid", gap: 5, marginBottom: 11, fontSize: 12, fontWeight: 700 }}>
                Section code
                <input required maxLength={50} style={inputStyle} value={newSection.sectionCode} onChange={event => setNewSection(current => ({ ...current, sectionCode: event.target.value }))} placeholder="e.g. 11C" />
              </label>
              <label style={{ display: "grid", gap: 5, marginBottom: 13, fontSize: 12, fontWeight: 700 }}>
                Student capacity (minimum 50)
                <input required type="number" min="50" style={inputStyle} value={newSection.capacity} onChange={event => setNewSection(current => ({ ...current, capacity: event.target.value }))} />
              </label>
              {createError && <p role="alert" style={{ color: "#b91c1c", fontSize: 13 }}>{createError}</p>}
              <button type="submit" disabled={creating} style={{ width: "100%", border: 0, borderRadius: 8, padding: 11, background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {creating ? "Creating…" : "Create section"}
              </button>
            </form>

            <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Existing sections</h2>
              {sections.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>No sections have been created yet.</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {sections.map(section => (
                    <button
                      type="button"
                      key={section.id}
                      onClick={() => { setSelectedId(section.id); setError(""); }}
                      style={{
                        border: selectedId === section.id ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        borderRadius: 9,
                        padding: 11,
                        background: selectedId === section.id ? "#eff6ff" : "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <strong>{section.sectionCode}</strong>
                      <span style={{ display: "block", color: "#64748b", fontSize: 12, marginTop: 4 }}>{termLabel(section)}</span>
                      <span style={{ display: "block", color: "#475569", fontSize: 12, marginTop: 5 }}>
                        {section.enrolledCount}/{section.capacity} enrolled · {section.scheduledSubjectCount}/{section.curriculumSubjectCount} subjects scheduled
                      </span>
                      {!section.isActive && <span style={{ color: "#b91c1c", fontSize: 11, fontWeight: 700 }}>Inactive</span>}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {unassignedEnrollments.length > 0 && (
              <section style={{ background: "#fff", border: "1px solid #fed7aa", borderRadius: 12, padding: 14 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 16 }}>Enrolled students needing a section</h2>
                <p style={{ margin: "0 0 12px", color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>
                  This is for students who were enrolled before automatic section assignment was added. New students are assigned automatically after payment approval.
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  {unassignedEnrollments.map(application => {
                    const eligibleSections = sections.filter(section =>
                      section.isActive &&
                      section.scheduleComplete &&
                      section.availableSeats > 0 &&
                      section.programCode === application.programCode &&
                      section.yearLevel === application.yearLevel &&
                      section.semester === application.semester);
                    const selectedSectionId = assignmentSectionIds[application.applicationId] || eligibleSections[0]?.id || "";
                    return (
                      <article key={application.applicationId} style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                        <strong style={{ display: "block", fontSize: 13 }}>{application.studentName}</strong>
                        <span style={{ display: "block", color: "#64748b", fontSize: 11, margin: "3px 0 7px" }}>
                          {application.programCode} · Year {application.yearLevel} · Semester {application.semester}
                        </span>
                        {eligibleSections.length > 0 ? (
                          <div style={{ display: "grid", gap: 7 }}>
                            <select
                              value={selectedSectionId}
                              onChange={event => setAssignmentSectionIds(current => ({
                                ...current,
                                [application.applicationId]: event.target.value,
                              }))}
                              style={inputStyle}
                            >
                              {eligibleSections.map(section => (
                                <option key={section.id} value={section.id}>
                                  {section.sectionCode} · {section.availableSeats} seats left
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={Boolean(assigningApplicationId)}
                              onClick={() => void assignExistingEnrollment(application)}
                              style={{ border: 0, borderRadius: 7, padding: 8, background: "#ea580c", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                            >
                              {assigningApplicationId === application.applicationId ? "Assigning…" : "Assign section"}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#9a3412", fontSize: 12 }}>No complete active section with available seats for this term.</span>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>

          {selectedSection ? (
            <section style={{ display: "grid", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 19 }}>{selectedSection.sectionCode} <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>· {termLabel(selectedSection)}</span></h2>
                    <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: 13 }}>
                      {selectedSection.enrolledCount} enrolled · {selectedSection.availableSeats} available seats · {selectedSection.scheduledSubjectCount}/{selectedSection.curriculumSubjectCount} subjects scheduled
                    </p>
                  </div>
                  <span style={{ color: selectedSection.scheduleComplete ? "#15803d" : "#b45309", fontWeight: 700, fontSize: 12 }}>
                    {selectedSection.scheduleComplete ? "Schedule complete" : "Schedule incomplete"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", marginTop: 16 }}>
                  <label style={{ display: "grid", gap: 5, color: "#475569", fontSize: 12, fontWeight: 700 }}>
                    Capacity (min 50)
                    <input type="number" min={Math.max(50, selectedSection.enrolledCount)} value={sectionSettings.capacity} onChange={event => setSectionSettings(current => ({ ...current, capacity: event.target.value }))} style={{ ...inputStyle, width: 140 }} />
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, color: "#475569", fontSize: 13, paddingBottom: 9 }}>
                    <input type="checkbox" checked={sectionSettings.isActive} onChange={event => setSectionSettings(current => ({ ...current, isActive: event.target.checked }))} />
                    Active for automatic assignment
                  </label>
                  <button type="button" disabled={savingSection} onClick={() => void saveSectionSettings()} style={{ border: 0, borderRadius: 8, padding: "10px 14px", background: "#334155", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    {savingSection ? "Saving…" : "Save section settings"}
                  </button>
                </div>
              </div>

              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
                <h2 style={{ margin: "0 0 6px", fontSize: 17 }}>Subject schedules</h2>
                <p style={{ margin: "0 0 14px", color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
                  Enter schedule details for every curriculum subject. A section is eligible for automatic student assignment only after all of its subjects are scheduled.
                </p>
                {sectionCourses.length === 0 ? (
                  <p style={{ borderRadius: 8, padding: 14, background: "#fff7ed", color: "#9a3412", fontSize: 13 }}>
                    No curriculum subjects exist for this program and term yet. Add them under Study Load & Curriculum Management first.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {sectionCourses.map(course => {
                      const form = scheduleForms[course.id] || existingSchedules[course.id] || emptySchedule();
                      const isScheduled = Boolean(existingSchedules[course.id]);
                      return (
                        <article key={course.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                            <div>
                              <strong style={{ color: "#2563eb" }}>{course.subjectCode}</strong>
                              <span style={{ marginLeft: 8 }}>{course.subjectTitle}</span>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: isScheduled ? "#15803d" : "#b45309" }}>
                              {isScheduled ? "Scheduled" : "Not scheduled"}
                            </span>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 9 }}>
                            {[
                              ["startTime", "Start time", "time"],
                              ["endTime", "End time", "time"],
                            ].map(([field, label, type]) => (
                              <label key={field} style={{ display: "grid", gap: 5, color: "#475569", fontSize: 11, fontWeight: 700 }}>
                                {label}
                                <input
                                  type={type}
                                  value={form[field] || ""}
                                  onChange={event => updateSchedule(course.id, field, event.target.value)}
                                  style={inputStyle}
                                />
                              </label>
                            ))}
                            <label style={{ display: "grid", gap: 5, color: "#475569", fontSize: 11, fontWeight: 700 }}>
                              Instructor
                              <select
                                required
                                value={form.instructorId || ""}
                                onChange={event => updateSchedule(course.id, "instructorId", event.target.value)}
                                style={inputStyle}
                              >
                                <option value="">Select an approved instructor</option>
                                {instructors.map(instructor => (
                                  <option key={instructor.id} value={instructor.id}>
                                    {instructor.fullName} · {instructor.email}
                                  </option>
                                ))}
                              </select>
                              {instructors.length === 0 && (
                                <span style={{ color: "#b45309", fontSize: 11, fontWeight: 500 }}>
                                  No approved instructors. <Link to="/admin/instructors" style={{ color: "#2563eb", fontWeight: 700 }}>Review instructor accounts</Link>.
                                </span>
                              )}
                            </label>
                            <label style={{ display: "grid", gap: 5, color: "#475569", fontSize: 11, fontWeight: 700 }}>
                              Classroom
                              <select
                                required
                                value={form.classroomId || ""}
                                onChange={event => updateSchedule(course.id, "classroomId", event.target.value)}
                                style={inputStyle}
                              >
                                <option value="">Select a classroom</option>
                                {activeRooms.map(room => (
                                  <option key={room.id} value={room.id}>
                                    {room.roomCode}{room.building ? ` · ${room.building}` : ""}
                                  </option>
                                ))}
                              </select>
                              {activeRooms.length === 0 && (
                                <span style={{ color: "#b45309", fontSize: 11, fontWeight: 500 }}>
                                  No active classrooms. <Link to="/admin/classrooms" style={{ color: "#2563eb", fontWeight: 700 }}>Register one</Link>.
                                </span>
                              )}
                            </label>
                          </div>
                          <fieldset style={{ border: 0, padding: 0, margin: "10px 0 0" }}>
                            <legend style={{ color: "#475569", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                              Class days (recurring weekly)
                            </legend>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {WEEKDAYS.map(([code, label]) => {
                                const checked = selectedWeekdays(form.days).includes(code);
                                return (
                                  <label
                                    key={code}
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 5,
                                      border: `1px solid ${checked ? "#93c5fd" : "#cbd5e1"}`,
                                      borderRadius: 7,
                                      padding: "7px 9px",
                                      background: checked ? "#eff6ff" : "#fff",
                                      color: checked ? "#1d4ed8" : "#475569",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => {
                                        const currentDays = selectedWeekdays(form.days);
                                        const nextDays = currentDays.includes(code)
                                          ? currentDays.filter(day => day !== code)
                                          : [...currentDays, code];
                                        updateSchedule(course.id, "days", WEEKDAYS
                                          .map(([dayCode]) => dayCode)
                                          .filter(dayCode => nextDays.includes(dayCode))
                                          .join(","));
                                      }}
                                    />
                                    {label}
                                  </label>
                                );
                              })}
                            </div>
                          </fieldset>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                            <button type="button" disabled={Boolean(savingStudyLoadId)} onClick={() => void saveSchedule(course)} style={{ border: 0, borderRadius: 7, padding: "8px 13px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                              {savingStudyLoadId === course.id ? "Saving…" : "Save subject schedule"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: 28, color: "#64748b", background: "#fff" }}>
              Create or select a section to manage its schedules.
            </section>
          )}
        </div>
      )}
    </main>
  );
}
