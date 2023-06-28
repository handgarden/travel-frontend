import {
  ValidationDefault,
  ValidationError,
  ValidationSuccess,
  ValidationValidating,
  ValidationWarning,
} from "../../../types/form/validation.type";

type ValidationStatusConstType = {
  DEFAULT: ValidationDefault;
  SUCCESS: ValidationSuccess;
  WARNING: ValidationWarning;
  ERROR: ValidationError;
  VALIDATING: ValidationValidating;
};

export const validationStatusConst: ValidationStatusConstType = {
  DEFAULT: "",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  VALIDATING: "validating",
};
