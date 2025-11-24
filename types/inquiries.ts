export type InquiryType =
  | "general"
  | "admission"
  | "technical"
  | "complaint"
  | "feedback";

export type InquiryStatus = "new" | "in_progress" | "resolved" | "closed";

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: InquiryType;
  status: InquiryStatus;
  submittedAt: string;
  respondedAt: string | null;
  assignedTo: string | null;
  response: string | null;
}

export const inquiryTypeLabels: Record<InquiryType, string> = {
  general: "General",
  admission: "Admission",
  technical: "Technical",
  complaint: "Complaint",
  feedback: "Feedback",
};

export const inquiryStatusLabels: Record<InquiryStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};
