export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

export interface ValidationProblemDetails extends ProblemDetails {
  errors: Record<string, string[]>;
}

export function isValidationProblemDetails(
  problemDetails: ProblemDetails,
): problemDetails is ValidationProblemDetails {
  return 'errors' in problemDetails;
}
