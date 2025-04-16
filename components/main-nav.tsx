import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./mobile-nav"

export function MainNav() {
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <MobileNav />
      <Link href="/dashboard" className="flex items-center space-x-2">
        <span className="font-bold text-xl hidden sm:inline-block text-neonBlue-700 dark:text-neonBlue-400">
          Fake API Generator
        </span>
        <span className="font-bold text-xl sm:hidden text-neonBlue-700 dark:text-neonBlue-400">FAG</span>
      </Link>
      <nav className="hidden md:flex gap-6">
        <Button
          variant="link"
          asChild
          className="text-neonBlue-600 hover:text-neonBlue-700 dark:text-neonBlue-400 dark:hover:text-neonBlue-300"
        >
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button
          variant="link"
          asChild
          className="text-neonBlue-600 hover:text-neonBlue-700 dark:text-neonBlue-400 dark:hover:text-neonBlue-300"
        >
          <Link href="/projects/new">New Project</Link>
        </Button>
      </nav>
    </div>
  )
}
