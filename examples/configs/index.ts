// JSON configs
export { default as patientIntakeConfig } from "./patient-intake.json";
export { default as jobApplicationConfig } from "./job-application.json";
export { default as supportTicketConfig } from "./support-ticket.json";
export { default as expenseReportConfig } from "./expense-report.json";
export { default as eventRegistrationConfig } from "./event-registration.json";
export { default as userSettingsConfig } from "./user-settings.json";
export { default as surveyConfig } from "./survey.json";
export { default as vehicleInsuranceQuoteConfig } from "./vehicle-insurance-quote.json";

// Bootstrap functions (side-effect registrations)
export { bootstrapPatientIntake } from "./patient-intake.bootstrap";
export { bootstrapJobApplication } from "./job-application.bootstrap";
export { bootstrapExpenseReport } from "./expense-report.bootstrap";
export { bootstrapEventRegistration } from "./event-registration.bootstrap";
export { bootstrapUserSettings } from "./user-settings.bootstrap";
export { bootstrapSurvey } from "./survey.bootstrap";
export { bootstrapVehicleInsuranceQuote } from "./vehicle-insurance-quote.bootstrap";
