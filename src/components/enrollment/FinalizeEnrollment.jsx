const SUBJECTS_FINAL = [
  { code:"CC 101",   title:"Introduction to Computing",   units:3, sched:"Mon / Wed", time:"7:30 – 9:00 AM",       room:"IT Lab 1",  instructor:"Prof. Santos" },
  { code:"CC 102",   title:"Programming Fundamentals",    units:3, sched:"Mon / Wed / Fri", time:"9:00 – 10:30 AM", room:"IT Lab 2",  instructor:"Prof. Villanueva" },
  { code:"MATH 201", title:"Discrete Mathematics",        units:3, sched:"Mon / Wed", time:"1:00 – 2:30 PM",       room:"Room 301",  instructor:"Prof. Cruz" },
  { code:"ENG 101",  title:"Technical Writing",           units:3, sched:"Tue / Thu", time:"7:30 – 9:00 AM",       room:"Room 105",  instructor:"Prof. Garcia" },
  { code:"PE 101",   title:"Physical Education 1",        units:2, sched:"Tue",        time:"3:00 – 5:00 PM",       room:"Gymnasium", instructor:"Coach Ramos" },
  { code:"NSTP 101", title:"National Service Training Program", units:3, sched:"Sat", time:"7:00 – 10:00 AM",      room:"AVR",       instructor:"Prof. Mendoza" },
];

// eslint-disable-next-line no-unused-vars
const NEXT_STEPS = [
  { icon:"💳", title:"Pay Tuition Fee", desc:"Visit the Cashier's Office within 3 business days. Bring your enrollment slip.", badge:"Urgent" },
  { icon:"📋", title:"Submit Physical Documents", desc:"Bring original copies of your requirements to the Registrar's Office.", badge:"Required" },
  { icon:"📱", title:"Access LMS", desc:"Log in to the Learning Management System to view your course materials.", badge:"Optional" },
  { icon:"📅", title:"Attend Orientation", desc:"BSIT 2nd Year orientation is on July 15, 2026 at 8:00 AM in AVR Hall.", badge:"Info" },
];

const BADGE_STYLES = {
  Urgent:   { bg:"#fee2e2", color:"#dc2626" },
  Required: { bg:"#fffbeb", color:"#d97706" },
  Optional: { bg:"#eff6ff", color:"#2563eb" },
  Info:     { bg:"#f0fdf4", color:"#16a34a" },
};

export default function FinalizeEnrollment({ onGoToStudyLoad }) {
  const adminApproved = false; // approval pending — show locked CTA

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
      {/* Success checkmark */}
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", border: "3px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 40 }}>
        ✓
      </div>

      {/* Heading */}
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>Requirements submitted!</h2>
      <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 28 }}>
        Sent for admin review. Your documents are being verified — we'll notify you once everything is approved.
      </p>

      {/* Divider */}
      <div style={{ height: 1, background: "#e2e8f0", margin: "24px 0" }}/>

      {/* Timeline */}
      <div style={{ textAlign: "left", margin: "28px 0" }}>
        {[
          { label: "Requirements submitted", desc: "Your documents have been sent", status: "done", icon: "✓" },
          { label: "Requirements submitted", desc: "Documents are being verified", status: "active", icon: "●" },
          { label: "Approval / Feedback", desc: "You will receive a notification", status: "pending", icon: "●" },
          { label: "Proceed to Payment", desc: "Appoint a payment slot", status: "pending", icon: "●" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20, position: "relative" }}>
            {/* Connector line */}
            {i < 3 && (
              <div style={{
                position: "absolute",
                left: 19,
                top: 40,
                width: 2,
                height: 24,
                background: item.status === "done" ? "#86efac" : item.status === "active" ? "#fbbf24" : "#e2e8f0",
              }} />
            )}
            
            {/* Icon */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: item.status === "done" ? "#f0fdf4" : item.status === "active" ? "#fef3c7" : "#f3f4f6",
              border: `2px solid ${item.status === "done" ? "#86efac" : item.status === "active" ? "#fbbf24" : "#e5e7eb"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 16,
              color: item.status === "done" ? "#16a34a" : item.status === "active" ? "#d97706" : "#9ca3af",
              fontWeight: 700,
            }}>
              {item.icon}
            </div>

            {/* Content */}
            <div style={{ paddingTop: 4 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: item.status === "done" ? "#16a34a" : item.status === "active" ? "#d97706" : "#9ca3af",
              }}>
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div style={{
        background: "#fffbeb",
        border: "1px solid #fcd34d",
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        margin: "24px 0",
        textAlign: "left",
      }}>
        <svg style={{ flexShrink: 0, marginTop: 2, color: "#d97706" }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
        </svg>
        <p style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.5 }}>
          Pending requirements will be followed up by the admin. Check your email regularly.
        </p>
      </div>

      {/* Button */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={adminApproved ? onGoToStudyLoad : undefined}
          disabled={!adminApproved}
          style={{
            padding: "12px 32px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: !adminApproved ? "not-allowed" : "pointer",
            background: !adminApproved ? "#cbd5e1" : "#2563eb",
            border: "none",
            color: !adminApproved ? "#94a3b8" : "#fff",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {!adminApproved ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Continue to appointment payment
            </>
          ) : (
            <>
              Continue to appointment payment
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </>
          )}
        </button>

        {!adminApproved && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
            <svg style={{ verticalAlign: "middle", marginRight: 8 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            This action is locked until admin approval is completed.
          </div>
        )}
      </div>
    </div>
  );
}
