import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function AuthPagesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return <>{children}</>
}
