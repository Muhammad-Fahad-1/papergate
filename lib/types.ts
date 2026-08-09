export type SubmissionStatus = "Draft" | "Under Review" | "Cleared" | "Rejected";

export interface Submission {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  status: SubmissionStatus;
  submittedAt: string; // ISO date string
  hash?: string;
  sealedAt?: string;
}