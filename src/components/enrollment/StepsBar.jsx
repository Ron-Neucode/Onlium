const ALL_STEPS = [
  { num: 1, label: "Personal information" },
  { num: 2, label: "Requirements" },
  { num: 3, label: "Program" },
  { num: 4, label: "Schedule" },
  { num: 5, label: "Review & submit" },
];

export default function StepsBar({ currentStep = 1, studentType, submitted }) {
  const steps = studentType === "continuing"
    ? ALL_STEPS.filter(step => step.num !== 3)
    : ALL_STEPS;
  const currentLabel = steps.find(step => step.num === currentStep)?.label;

  return (
    <>
      <div className="enrollment-progress__steps">
        {steps.map(({ num, label }, index) => {
          const isLastStep = index === steps.length - 1;
          const isDone = submitted && isLastStep ? true : num < currentStep;
          const isActive = !isDone && num === currentStep;
          const circleClass = isDone
            ? "enrollment-progress__circle--complete"
            : isActive
              ? "enrollment-progress__circle--active"
              : "enrollment-progress__circle--upcoming";

          return (
            <div className="enrollment-progress__step" key={num}>
              <div
                className="enrollment-progress__item"
                aria-current={isActive ? "step" : undefined}
              >
                <div className={`enrollment-progress__circle ${circleClass}`}>
                  {isDone ? "✓" : index + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className={`enrollment-progress__label${isActive ? " enrollment-progress__label--active" : ""}`}>
                    {label}
                  </div>
                  <div className={`enrollment-progress__status${isDone ? " enrollment-progress__status--complete" : isActive ? " enrollment-progress__status--active" : ""}`}>
                    {isDone ? "Complete" : isActive ? "In progress" : " "}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`enrollment-progress__connector${num < currentStep ? " enrollment-progress__connector--complete" : ""}`} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>
      <div className="enrollment-mobile-step">{currentLabel}</div>
    </>
  );
}
