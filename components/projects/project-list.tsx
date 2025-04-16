import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ExternalLink } from "lucide-react"
import type { Project } from "@/lib/projects"

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className="flex flex-col border-neonBlue-100 dark:border-neonBlue-900 hover:border-neonBlue-300 dark:hover:border-neonBlue-700 transition-colors"
        >
          <CardHeader className="pb-2">
            <CardTitle className="line-clamp-1 text-neonBlue-700 dark:text-neonBlue-400">{project.name}</CardTitle>
            <CardDescription className="line-clamp-2">{project.description || "No description"}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow pb-2">
            {project.baseUrl && (
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <ExternalLink className="h-4 w-4 mr-1 flex-shrink-0 text-neonBlue-500" />
                <span className="truncate">{project.baseUrl}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4 mr-1 flex-shrink-0 text-neonBlue-500" />
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-neonBlue-600 hover:bg-neonBlue-700">
              <Link href={`/projects/${project.id}`}>View Project</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
