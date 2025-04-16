import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function CreateProjectButton() {
  return (
    <Button asChild className="bg-neonBlue-600 hover:bg-neonBlue-700">
      <Link href="/projects/new">
        <PlusCircle className="h-4 w-4 mr-2" />
        New Project
      </Link>
    </Button>
  )
}
