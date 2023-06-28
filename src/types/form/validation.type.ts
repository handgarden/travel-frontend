export type ValidationDefault = "";
export type ValidationSuccess = "success";
export type ValidationWarning = "warning";
export type ValidationError = "error";
export type ValidationValidating = "validating";

export type ValidationStatus =
  | ValidationDefault
  | ValidationSuccess
  | ValidationWarning
  | ValidationError
  | ValidationValidating;
