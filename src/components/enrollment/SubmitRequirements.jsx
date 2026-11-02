import { useState } from "react";
import { apiService } from "../../services/apiService";

const TYPE_LABEL = {
  new: "New Student",
  transferee: "Transferee",
  continuing: "Continuing Student",
};

const PROGRAM_LABEL = {
  BSIT: "BS Information Technology",
  BSCS: "BS Computer Science",
  BSA: "BS Accounting",
  BSBA: "BS Business Administration",
  BSHM: "BS Hospitality Management",
};

const SCHEDULE_LABEL = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export default function SubmitRequirements({
  onBack,
  onNext,
  onSubmitted,
  studentType,
  irregular,
  applicant,
  program,
  schedule,
  files,
  applicationId,
  onApplicationCreated,
  uploadedRequirements,
  onRequirementUploaded,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmPending, setConfirmPending] = useState(false);
  const [error, setError] = useState("");

  const studentName = [applicant?.firstName, applicant?.lastName].filter(Boolean).join(" ");
  const summaryRows = [
    { label: "Student Name", value: studentName },
    { label: "Student Type", value: TYPE_LABEL[studentType] },
    ...(studentType === "continuing" && irregular
      ? [{ label: "Student Status", value: irregular === "yes" ? "Irregular Student" : "Regular Student" }]
      : []),
    ...(studentType === "transferee"
      ? [
          { label: "Previous School", value: applicant.previousSchoolName },
          { label: "Previous School Address", value: applicant.previousSchoolAddress },
          { label: "Previous Program", value: applicant.previousProgram },
          {
            label: "Last Year Level Completed",
            value: `${applicant.previousYearLevel}${applicant.previousYearLevel === "1" ? "st" : applicant.previousYearLevel === "2" ? "nd" : applicant.previousYearLevel === "3" ? "rd" : "th"} Year`,
          },
        ]
      : []),
    ...(studentType === "new"
      ? [
          { label: "Senior High School", value: applicant.highSchoolName },
          { label: "School Address", value: applicant.highSchoolAddress },
          { label: "Year Graduated", value: applicant.graduationYear },
        ]
      : []),
    { label: "Program", value: PROGRAM_LABEL[program.programCode] || program.programCode },
    { label: "Year Level", value: `${program.yearLevel}${program.yearLevel === 1 ? "st" : program.yearLevel === 2 ? "nd" : program.yearLevel === 3 ? "rd" : "th"} Year` },
    { label: "Semester", value: program.semester === 3 ? "Summer" : `${program.semester === 1 ? "First" : "Second"} Semester` },
    { label: "Preferred Schedule", value: SCHEDULE_LABEL[schedule] },
    {
      label: "Uploaded Documents",
      value: `${new Set([
        ...uploadedRequirements.map(requirement => typeof requirement === "string" ? requirement : requirement.requirementType),
        ...Object.keys(files),
      ]).size} document(s)`,
    },
  ];

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      let activeApplicationId = applicationId;
      const applicationData = {
        studentType: studentType === "new" ? "NewIncoming" : studentType === "transferee" ? "Transferee" : "Continuing",
        programCode: program.programCode,
        yearLevel: Number(program.yearLevel),
        semester: Number(program.semester),
        preferredSchedule: SCHEDULE_LABEL[schedule],
        isIrregular: studentType === "continuing" ? irregular === "yes" : null,
        firstName: applicant.firstName.trim(),
        lastName: applicant.lastName.trim(),
        phoneNumber: applicant.phoneNumber.trim(),
        address: applicant.address.trim(),
        birthDate: applicant.birthDate,
        gender: applicant.gender,
        guardianFirstName: applicant.guardianFirstName || null,
        guardianLastName: applicant.guardianLastName || null,
        guardianRelationship: applicant.guardianRelationship || null,
        guardianContactNumber: applicant.guardianContactNumber || null,
        guardianAddress: applicant.guardianAddress || null,
        previousSchoolName: applicant.previousSchoolName || null,
        previousSchoolAddress: applicant.previousSchoolAddress || null,
        previousProgram: applicant.previousProgram || null,
        previousYearLevel: applicant.previousYearLevel ? Number(applicant.previousYearLevel) : null,
        highSchoolName: applicant.highSchoolName || null,
        highSchoolAddress: applicant.highSchoolAddress || null,
        graduationYear: applicant.graduationYear ? Number(applicant.graduationYear) : null,
      };

      if (!activeApplicationId) {
        const created = await apiService.createApplication(applicationData);
        activeApplicationId = created.id;
        if (!activeApplicationId) throw new Error("The API created the application but did not return its ID.");
        onApplicationCreated(activeApplicationId);
      } else {
        await apiService.updateApplicationDraft(activeApplicationId, applicationData);
      }

      for (const [requirementType, file] of Object.entries(files)) {
        if (uploadedRequirements.some(requirement =>
          (typeof requirement === "string" ? requirement : requirement.requirementType) === requirementType
        )) continue;
        await apiService.uploadApplicationRequirement(activeApplicationId, file, requirementType);
        onRequirementUploaded(requirementType);
      }

      await apiService.submitApplication(activeApplicationId);
      setSubmitted(true);
      onSubmitted?.();
    } catch (submissionError) {
      setError(submissionError.message || "Enrollment submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 48, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 20, background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 700, border: "1px solid #86efac", marginBottom: 16 }}>
          Successfully Submitted
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 10px" }}>Requirements Submitted!</h2>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 20px" }}>
          Your application and requirements were sent to the admin for review. Your Student ID will be assigned after approval.
        </p>
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "14px 20px", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <span style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>Status: Waiting for admin approval</span>
        </div>
        <br />
        <button onClick={() => onNext?.()} style={{ padding: "10px 28px", borderRadius: 8, background: "#2563eb", color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.08)", overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Review and Submit</h2>
        <p style={{ margin: "5px 0 0", fontSize: 12, color: "#64748b" }}>Confirm your information before sending it for admin review.</p>
      </div>

      <div style={{ padding: 24 }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          {summaryRows.map((row, index) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: index % 2 === 0 ? "#f8fafc" : "#fff" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>{row.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: "1px solid #eef2f6", borderRadius: 8 }}>
            <input type="checkbox" checked={confirmAll} onChange={event => setConfirmAll(event.target.checked)} />
            <span style={{ fontSize: 13 }}>I confirm that my information and uploaded documents are accurate.</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: "1px solid #eef2f6", borderRadius: 8 }}>
            <input type="checkbox" checked={confirmPending} onChange={event => setConfirmPending(event.target.checked)} />
            <span style={{ fontSize: 13 }}>I understand that my application is pending admin approval.</span>
          </label>
        </div>

        {error && <p role="alert" style={{ color: "#b91c1c", fontSize: 13, margin: "16px 0 0" }}>{error}</p>}
      </div>

      <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", background: "#f8fafc" }}>
        <button type="button" onClick={onBack} disabled={submitting} style={{ padding: "10px 18px", borderRadius: 8, background: "#fff", border: "1px solid #cbd5e1", color: "#475569", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !(confirmAll && confirmPending)}
          style={{ padding: "10px 22px", borderRadius: 8, fontWeight: 600, cursor: submitting || !(confirmAll && confirmPending) ? "not-allowed" : "pointer", background: confirmAll && confirmPending ? "#2563eb" : "#cbd5e1", border: "none", color: confirmAll && confirmPending ? "#fff" : "#64748b" }}
        >
          {submitting ? "Submitting…" : "Submit for Admin Review"}
        </button>
      </div>
    </div>
  );
}
