import { SubmissionStatus } from "./types";

export const statusStyles: Record<SubmissionStatus, string> = {
  Draft: "bg-slate-100 text-slate-700",
  "Under Review": "bg-amber-100 text-amber-800",
  Cleared: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};