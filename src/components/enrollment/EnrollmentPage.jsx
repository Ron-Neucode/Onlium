import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalInformation from "./PersonalInformation";
import UploadRequirements from "./UploadRequirements";
import SelectProgram from "./SelectProgram";
import ChooseSchedule from "./ChooseSchedule";
import SubmitRequirements from "./SubmitRequirements";
import StepsBar from "./StepsBar";
import { apiService } from "../../services/apiService";
import { authService } from "../../services/authService";
import "./enrollment.css";

const TYPE_LABEL = {
  new: "New Student",
  transferee: "Transferee",
  continuing: "Continuing Student",
};

export default function EnrollmentPage({ onScheduleSaved, onGoToStudyLoad }) {
  const navigate = useNavigate();
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [draftError, setDraftError] = useState("");
  const [draftLoadAttempt, setDraftLoadAttempt] = useState(0);
  const [step, setStep] = useState(1);
  const [applicant, setApplicant] = useState(null);
  const [program, setProgram] = useState({ programCode: "BSIT", yearLevel: 2, semester: 1 });
  const [schedule, setSchedule] = useState("");
  const [files, setFiles] = useState({});
  const [applicationId, setApplicationId] = useState(null);
  const [uploadedRequirements, setUploadedRequirements] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const studentType = applicant?.studentType || null;
  const irregular = applicant?.irregular || null;

  useEffect(() => {
    let isCurrent = true;

    async function loadDraft() {
      setLoadingDraft(true);
      setDraftError("");
      try {
        const applications = await apiService.getMyApplications();
        const draft = applications.find(application => application.status?.toLowerCase() === "draft");
        if (!draft || !isCurrent) return;

        const studentType = {
          NewIncoming: "new",
          Transferee: "transferee",
          Continuing: "continuing",
        }[draft.studentType];
        if (!studentType) {
          throw new Error("The saved application has an unsupported student type.");
        }

        setApplicant({
          studentType,
          irregular: draft.isIrregular == null ? "" : draft.isIrregular ? "yes" : "no",
          firstName: draft.firstName || "",
          lastName: draft.lastName || "",
          phoneNumber: draft.phoneNumber || "",
          address: draft.address || "",
          birthDate: draft.birthDate?.slice(0, 10) || "",
          gender: draft.gender || "",
          guardianFirstName: draft.guardianFirstName || "",
          guardianLastName: draft.guardianLastName || "",
          guardianRelationship: draft.guardianRelationship || "",
          guardianContactNumber: draft.guardianContactNumber || "",
          guardianAddress: draft.guardianAddress || "",
          previousSchoolName: draft.previousSchoolName || "",
          previousSchoolAddress: draft.previousSchoolAddress || "",
          previousProgram: draft.previousProgram || "",
          previousYearLevel: draft.previousYearLevel ? String(draft.previousYearLevel) : "",
          highSchoolName: draft.highSchoolName || "",
          highSchoolAddress: draft.highSchoolAddress || "",
          graduationYear: draft.graduationYear ? String(draft.graduationYear) : "",
        });
        setProgram({
          programCode: draft.programCode,
          yearLevel: draft.yearLevel,
          semester: draft.semester,
        });
        setSchedule(draft.preferredSchedule?.toLowerCase() || "");
        setApplicationId(draft.id);
        setUploadedRequirements(draft.requirements || []);
      } catch (error) {
        if (isCurrent) setDraftError(error.message || "Unable to load your saved application.");
      } finally {
        if (isCurrent) setLoadingDraft(false);
      }
    }

    loadDraft();
    return () => {
      isCurrent = false;
    };
  }, [draftLoadAttempt]);

  function updateFiles(requirementFiles) {
    setFiles(requirementFiles);
  }

  function finishSchedule(value) {
    setSchedule(value);
    onScheduleSaved?.(value);
    setStep(5);
  }

  if (loadingDraft) {
    return <p role="status" className="enrollment-form__hint">Checking for a saved enrollment draft…</p>;
  }

  if (draftError) {
    const sessionExpired = draftError === "Your session is invalid or expired. Please sign in again.";
    return (
      <div className="enrollment-form__error" role="alert">
        <p>{draftError}</p>
        {sessionExpired ? (
          <button
            type="button"
            className="enrollment-button"
            onClick={() => {
              authService.clearUserSession();
              navigate("/register/login", { replace: true });
            }}
          >
            Sign in again
          </button>
        ) : (
          <button type="button" className="enrollment-button" onClick={() => setDraftLoadAttempt(attempt => attempt + 1)}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <main className="enrollment-page">
      <header className="enrollment-heading">
        <div className="enrollment-heading__content">
          <p className="enrollment-eyebrow">Student Services · Enrollment</p>
          <h1>Enrollment application</h1>
          <p className="enrollment-heading__subtitle">
            Complete each section to prepare your application for registrar review. Your progress through the form is clearly tracked.
          </p>
        </div>
        <div className="enrollment-heading__badge" aria-label="Student portal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Student application
        </div>
      </header>

      <section className="enrollment-progress" aria-label="Enrollment progress">
        <div className="enrollment-progress__caption">
          <span>Application progress</span>
          <span>{studentType ? TYPE_LABEL[studentType] : "Choose student type to begin"}</span>
        </div>
        <StepsBar currentStep={step} studentType={studentType} submitted={submitted} />
      </section>

      {step === 1 && (
        <PersonalInformation
          initialDetails={applicant || undefined}
          initialStudentType={studentType || ""}
          initialIrregular={irregular || ""}
          studentTypeLocked={uploadedRequirements.length > 0}
          onNext={details => {
            if (applicant?.studentType !== details.studentType) setFiles({});
            setApplicant(details);
            if (details.studentType === "new") {
              setProgram({ programCode: "BSIT", yearLevel: 1, semester: 1 });
            } else if (details.studentType === "transferee") {
              setProgram({ programCode: "BSIT", yearLevel: "", semester: 1 });
            }
            setStep(2);
          }}
        />
      )}

      {step === 2 && (
        <UploadRequirements
          studentType={studentType}
          files={files}
          existingRequirements={uploadedRequirements}
          onFilesChange={updateFiles}
          onBack={() => setStep(1)}
          onNext={() => setStep(studentType === "continuing" ? 4 : 3)}
        />
      )}

      {step === 3 && (
        <SelectProgram
          studentType={studentType}
          value={program}
          onBack={() => setStep(2)}
          onNext={selectedProgram => {
            setProgram(selectedProgram);
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <ChooseSchedule
          value={schedule}
          onBack={() => setStep(studentType === "continuing" ? 2 : 3)}
          onNext={finishSchedule}
        />
      )}

      {step === 5 && (
        <SubmitRequirements
          onBack={() => setStep(4)}
          onNext={onGoToStudyLoad}
          onSubmitted={() => setSubmitted(true)}
          studentType={studentType}
          irregular={irregular}
          applicant={applicant}
          program={program}
          schedule={schedule}
          files={files}
          applicationId={applicationId}
          onApplicationCreated={setApplicationId}
          uploadedRequirements={uploadedRequirements}
          onRequirementUploaded={type => setUploadedRequirements(previous => (
            previous.some(requirement => requirement.requirementType === type)
              ? previous
              : [...previous, { requirementType: type }]
          ))}
        />
      )}
    </main>
  );
}
