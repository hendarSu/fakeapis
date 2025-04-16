"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-neonBlue-600 hover:text-neonBlue-700 hover:bg-neonBlue-50 dark:text-neonBlue-400 dark:hover:bg-neonBlue-900/50"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] border-r-neonBlue-200 dark:border-r-neonBlue-900">
        <div className="flex flex-col gap-4 py-4">
          <div className="font-bold text-xl text-neonBlue-700 dark:text-neonBlue-400 mb-4">Fake API Generator</div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-neonBlue-600 hover:text-neonBlue-700 dark:text-neonBlue-400 dark:hover:text-neonBlue-300"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/projects/new"
            className="text-sm font-medium text-neonBlue-600 hover:text-neonBlue-700 dark:text-neonBlue-400 dark:hover:text-neonBlue-300"
            onClick={() => setOpen(false)}
          >
            New Project
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
