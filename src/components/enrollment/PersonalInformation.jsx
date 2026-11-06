import { useState } from "react";
import { authService } from "../../services/authService.js";

const STUDENT_TYPES = [
  { key: "new", label: "New student", description: "Applying to Onlium for the first time" },
  { key: "transferee", label: "Transferee", description: "Continuing your studies from another school" },
  { key: "continuing", label: "Continuing student", description: "Already enrolled at Onlium" },
];

const REQUIRED_FIELD_LABELS = {
  firstName: "First Name",
  lastName: "Last Name",
  phoneNumber: "Mobile Number",
  address: "Home address",
  birthDate: "Date of Birth",
  gender: "Gender",
  guardianFirstName: "Guardian First Name",
  guardianLastName: "Guardian Last Name",
  guardianRelationship: "Relationship",
  guardianContactNumber: "Guardian Contact Number",
  guardianAddress: "Guardian address",
  previousSchoolName: "Previous school name",
  previousSchoolAddress: "Previous school address",
  previousProgram: "Previous program or course",
  previousYearLevel: "Last year level completed",
  highSchoolName: "Senior high school name",
  highSchoolAddress: "School address",
  graduationYear: "Year graduated",
};

function getInitialDetails() {
  try {
    const user = authService.getUserSession() || {};
    return {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
      birthDate: "",
      gender: "",
      guardianFirstName: "",
      guardianLastName: "",
      guardianRelationship: "",
      guardianContactNumber: "",
      guardianAddress: "",
      previousSchoolName: "",
      previousSchoolAddress: "",
      previousProgram: "",
      previousYearLevel: "",
      highSchoolName: "",
      highSchoolAddress: "",
      graduationYear: "",
    };
  } catch (error) {
    console.error("Unable to read the current student profile.", error);
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
      gender: "",
      guardianFirstName: "",
      guardianLastName: "",
      guardianRelationship: "",
      guardianContactNumber: "",
      guardianAddress: "",
      previousSchoolName: "",
      previousSchoolAddress: "",
      previousProgram: "",
      previousYearLevel: "",
      highSchoolName: "",
      highSchoolAddress: "",
      graduationYear: "",
    };
  }
}

export default function PersonalInformation({
  onNext,
  initialDetails,
  initialStudentType = "",
  initialIrregular = "",
  hasEnrollmentRecord = false,
  studentTypeLocked = false,
}) {
  const [studentType, setStudentType] = useState(initialStudentType);
  const [irregular, setIrregular] = useState(initialIrregular);
  const [details, setDetails] = useState(() => ({ ...getInitialDetails(), ...initialDetails }));
  const [error, setError] = useState("");
  const isContinuing = studentType === "continuing";

  function updateDetail(event) {
    const { name, value } = event.target;
    setDetails(previous => ({ ...previous, [name]: value }));
  }

  function handleNext() {
    if (!studentType) {
      setError("Choose your student type before continuing.");
      return;
    }
    if (isContinuing && !irregular) {
      setError("Choose whether you are a regular or irregular student.");
      return;
    }

    const requiredFields = [
      "firstName",
      "lastName",
      "phoneNumber",
      "address",
      "birthDate",
      "gender",
    ];
    if (studentType !== "continuing") {
      requiredFields.push(
        "guardianFirstName",
        "guardianLastName",
        "guardianRelationship",
        "guardianContactNumber",
        "guardianAddress",
      );
    }
    if (studentType === "transferee") {
      requiredFields.push("previousSchoolName", "previousSchoolAddress", "previousProgram", "previousYearLevel");
    }
    if (studentType === "new") {
      requiredFields.push("highSchoolName", "highSchoolAddress", "graduationYear");
      const year = Number(details.graduationYear);
      if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
        setError("Enter a valid senior high school graduation year.");
        return;
      }
    }
    const missingField = requiredFields.find(field => !String(details[field] ?? "").trim());
    if (missingField) {
      setError(`Complete the required field "${REQUIRED_FIELD_LABELS[missingField]}" before continuing.`);
      return;
    }

    setError("");
    onNext?.({ ...details, studentType, irregular: isContinuing ? irregular : null });
  }

  const renderField = (label, name, type = "text", required = true) => (
    <label key={name} className="enrollment-form__field">
      <span className="enrollment-form__label">
        {label}{required && <span className="enrollment-form__required"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        value={details[name]}
        onChange={updateDetail}
        required={required}
        className="enrollment-form__input"
      />
    </label>
  );

  return (
    <section className="enrollment-form" aria-labelledby="personal-info-title">
      <header className="enrollment-form__header">
        <div className="enrollment-form__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
          </svg>
        </div>
        <div>
          <h2 id="personal-info-title" className="enrollment-form__title">Personal information</h2>
          <p className="enrollment-form__description">Tell us about yourself so the registrar can review your application.</p>
        </div>
      </header>

      <div className="enrollment-form__body">
        <h3 className="enrollment-section">Select your student type</h3>
        <div className="enrollment-type-grid" role="group" aria-label="Student type">
          {STUDENT_TYPES.map(type => {
            const selected = studentType === type.key;
            const typeRequiresEnrollmentRecord = type.key === "continuing";
            const eligibilityDisallowsType = typeRequiresEnrollmentRecord !== hasEnrollmentRecord;
            const disabled = !selected && (eligibilityDisallowsType || studentTypeLocked);
            const disabledReason = eligibilityDisallowsType
              ? hasEnrollmentRecord
                ? "Your existing Onlium enrollment record means you must apply as a continuing student."
                : "Available after you have an official Onlium enrollment record."
              : studentTypeLocked && !selected
                ? "Student type cannot be changed after requirements have been uploaded."
                : "";
            return (
              <button
                key={type.key}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                className={`enrollment-type-card${selected ? " enrollment-type-card--selected" : ""}${disabled ? " enrollment-type-card--disabled" : ""}`}
                onClick={() => {
                  setStudentType(type.key);
                  setError("");
                }}
              >
                <span className="enrollment-type-card__check" aria-hidden="true">{selected ? "✓" : ""}</span>
                <span className="enrollment-type-card__title">{type.label}</span>
                <span className="enrollment-type-card__description">{type.description}</span>
                {disabledReason && <span className="enrollment-type-card__reason">{disabledReason}</span>}
              </button>
            );
          })}
        </div>

        {!studentType && (
          <p className="enrollment-form__hint">Choose the option that best describes your enrollment status to see the relevant details.</p>
        )}

        {studentType && (
          <>
            {isContinuing && (
              <>
                <h3 className="enrollment-section">Enrollment status</h3>
                <div className="enrollment-choice-group" role="radiogroup" aria-label="Regular or irregular student">
                  {[
                    ["no", "Regular student"],
                    ["yes", "Irregular student"],
                  ].map(([value, label]) => (
                    <label key={value} className="enrollment-choice">
                      <input
                        type="radio"
                        name="irregular"
                        value={value}
                        checked={irregular === value}
                        onChange={() => {
                          setIrregular(value);
                          setError("");
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </>
            )}

            <h3 className="enrollment-section">Student details</h3>
            <div className="enrollment-form__grid">
            {renderField("First Name", "firstName")}
            {renderField("Last Name", "lastName")}
            {renderField("Mobile Number", "phoneNumber", "tel")}
            {renderField("Date of Birth", "birthDate", "date")}
            <label className="enrollment-form__field">
              <span className="enrollment-form__label">Gender <span className="enrollment-form__required">*</span></span>
              <select name="gender" value={details.gender} onChange={updateDetail} className="enrollment-form__input" required>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="enrollment-form__field enrollment-form__field--wide">
              <span className="enrollment-form__label">Home address <span className="enrollment-form__required">*</span></span>
              <input name="address" value={details.address} onChange={updateDetail} required className="enrollment-form__input" />
            </label>
          </div>

          {!isContinuing && (
            <>
              <h3 className="enrollment-section">Parent or guardian details</h3>
              <div className="enrollment-form__grid">
                {renderField("Guardian First Name", "guardianFirstName")}
                {renderField("Guardian Last Name", "guardianLastName")}
                {renderField("Guardian Contact Number", "guardianContactNumber", "tel")}
                <label className="enrollment-form__field">
                  <span className="enrollment-form__label">Relationship <span className="enrollment-form__required">*</span></span>
                  <select
                    name="guardianRelationship"
                    value={details.guardianRelationship}
                    onChange={updateDetail}
                    className="enrollment-form__input"
                    required
                  >
                    <option value="">Select relationship</option>
                    <option>Mother</option>
                    <option>Father</option>
                    <option>Guardian</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="enrollment-form__field enrollment-form__field--wide">
                  <span className="enrollment-form__label">Guardian address <span className="enrollment-form__required">*</span></span>
                  <input name="guardianAddress" value={details.guardianAddress} onChange={updateDetail} required className="enrollment-form__input" />
                </label>
              </div>
            </>
          )}
          {studentType === "transferee" && (
            <>
              <h3 className="enrollment-section">Previous school information</h3>
              <p className="enrollment-form__hint" style={{ margin: "-2px 0 14px" }}>
                Provide your most recent school details to help the registrar evaluate your transfer and year-level placement.
              </p>
              <div className="enrollment-form__grid">
                {renderField("Previous school name", "previousSchoolName")}
                {renderField("Previous school address", "previousSchoolAddress")}
                {renderField("Previous program or course", "previousProgram")}
                <label className="enrollment-form__field">
                  <span className="enrollment-form__label">Last year level completed <span className="enrollment-form__required">*</span></span>
                  <select
                    name="previousYearLevel"
                    value={details.previousYearLevel}
                    onChange={updateDetail}
                    className="enrollment-form__input"
                    required
                  >
                    <option value="">Select year level</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </label>
              </div>
            </>
          )}
          {studentType === "new" && (
            <>
              <h3 className="enrollment-section">Senior high school background</h3>
              <p className="enrollment-form__hint" style={{ margin: "-2px 0 14px" }}>
                Enter the school where you completed senior high school.
              </p>
              <div className="enrollment-form__grid">
                {renderField("Senior high school name", "highSchoolName")}
                {renderField("School address", "highSchoolAddress")}
                <label className="enrollment-form__field">
                  <span className="enrollment-form__label">Year graduated <span className="enrollment-form__required">*</span></span>
                  <input
                    name="graduationYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={details.graduationYear}
                    onChange={updateDetail}
                    className="enrollment-form__input"
                    required
                  />
                </label>
              </div>
            </>
          )}
          <div className="enrollment-callout" style={{ marginTop: 22 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 11v5m0-8h.01" />
            </svg>
            <span><strong>Before you continue:</strong> Make sure the information matches your official documents. The registrar may contact you if any details need clarification.</span>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="enrollment-form__error">
          {error}
        </p>
      )}
      </div>

      <footer className="enrollment-form__footer">
        <p className="enrollment-form__footer-note"><span className="enrollment-form__required">*</span> Required information</p>
        <button
          type="button"
          onClick={handleNext}
          className="enrollment-button"
        >
          Continue to requirements
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </button>
      </footer>
    </section>
  );
}
