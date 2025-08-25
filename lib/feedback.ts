export type FeedbackType = "New Feature" | "General Feedback"

export interface Feedback {
  id: string
  title: string
  type: FeedbackType
  description: string
  created_by: string
  created_at: string
  createdByName: string
}
