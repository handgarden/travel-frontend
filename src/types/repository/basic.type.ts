export type BindingError = {
  codes: string[];
  defaultMessage: string;
  objectName: string;
  field: string;
};

export type ErrorResponse = {
  status: number;
  message: string;
  bindingErrors: BindingError[];
};

export type ResponseTemplate<T> = {
  success: boolean;
  response: T | null;
  error: ErrorResponse | null;
};

export type PaginationResponse<T> = {
  data: T[];
  total: number;
};

export type PaginationQuery = {
  page: number;
  size: number;
};

export type BASIC_SUCCESS_MESSAGE = "success";
