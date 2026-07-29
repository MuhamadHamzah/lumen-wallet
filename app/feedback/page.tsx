"use client"

import { AppShell } from "@/components/app-shell"
import { FeedbackAnalytics } from "@/components/dashboard/feedback-analytics"

export default function FeedbackPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <FeedbackAnalytics />
      </div>
    </AppShell>
  )
}
