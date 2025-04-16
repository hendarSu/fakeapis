import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const user = await getCurrentUser()

  // If user is already logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white dark:bg-gray-950">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="font-bold text-xl text-neonBlue-700 dark:text-neonBlue-400">Fake API Generator</div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" asChild size="sm" className="sm:h-10 sm:px-4 sm:py-2">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="sm:h-10 sm:px-4 sm:py-2 bg-neonBlue-600 hover:bg-neonBlue-700">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-20 lg:py-32 neon-gradient">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-neonBlue-700 to-neonBlue-500">
                  Create Fake APIs in Seconds
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Generate mock APIs from curl commands with dynamic responses based on request data.
                </p>
              </div>
              <div className="space-x-4 mt-6">
                <Button size="lg" asChild className="bg-neonBlue-600 hover:bg-neonBlue-700">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-20 lg:py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 md:px-6">
            <h2 className="text-2xl font-bold text-center mb-12 text-neonBlue-700 dark:text-neonBlue-400">
              Powerful Features
            </h2>
            <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2 p-6 border rounded-lg hover:border-neonBlue-400 transition-colors">
                <h3 className="text-xl font-bold text-neonBlue-700 dark:text-neonBlue-400">
                  Project-Based Organization
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Organize your fake APIs into projects for better management.
                </p>
              </div>
              <div className="space-y-2 p-6 border rounded-lg hover:border-neonBlue-400 transition-colors">
                <h3 className="text-xl font-bold text-neonBlue-700 dark:text-neonBlue-400">Dynamic Responses</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Configure dynamic fields that respond to request data.
                </p>
              </div>
              <div className="space-y-2 p-6 border rounded-lg hover:border-neonBlue-400 transition-colors">
                <h3 className="text-xl font-bold text-neonBlue-700 dark:text-neonBlue-400">Custom Domains</h3>
                <p className="text-gray-500 dark:text-gray-400">Use your own domain for accessing your fake APIs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 bg-gray-50 dark:bg-gray-900">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row px-4 md:px-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Fake API Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
