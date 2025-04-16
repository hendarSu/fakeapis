import type React from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"

// Rename the component to make it clearer
export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <MainNav />
          <UserNav user={user} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
