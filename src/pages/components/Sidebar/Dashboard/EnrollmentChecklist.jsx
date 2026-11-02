import "./EnrollmentChecklist.css";

const CHECKLIST = [
  { label: "Personal information", status: "done" },
  { label: "Upload requirements", status: "pending" },
  { label: "Select program", status: "done" },
  { label: "Admin review", status: "locked" },
];

export default function EnrollmentChecklist() {
  return (
    <div className="card">
      <div className="card-title">Enrollment checklist</div>
      {CHECKLIST.map((item) => (
        <div className="checklist-row" key={item.label}>
          <span className="checklist-label">{item.label}</span>
          <span className={`status-pill status-${item.status}`}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
}