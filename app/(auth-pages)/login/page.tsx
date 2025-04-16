import { LoginForm } from "@/components/auth/login-form"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage() {
  // The parent layout already handles this redirect, but keeping it for safety
  const user = await getCurrentUser()

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in to your account</p>
        </div>
        <LoginForm />
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
