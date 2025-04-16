"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerAction } from "@/lib/auth-actions"

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await registerAction({ name, email, password })

      if (result.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="border-neonBlue-200 dark:border-neonBlue-800 focus-visible:ring-neonBlue-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="border-neonBlue-200 dark:border-neonBlue-800 focus-visible:ring-neonBlue-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
              className="border-neonBlue-200 dark:border-neonBlue-800 focus-visible:ring-neonBlue-500"
            />
          </div>

          <Button type="submit" disabled={loading} className="bg-neonBlue-600 hover:bg-neonBlue-700">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-neonBlue-600 hover:text-neonBlue-700 dark:text-neonBlue-400 dark:hover:text-neonBlue-300 underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
