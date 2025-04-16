import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { getUserProjects } from "@/lib/projects"
import { ProjectList } from "@/components/projects/project-list"
import { CreateProjectButton } from "@/components/projects/create-project-button"

export default async function DashboardPage() {
  const user = await requireAuth()
  const projects = await getUserProjects()

  if (projects.length === 0) {
    // If no projects, redirect to create project page
    redirect("/projects/new")
  }

  return (
    <div className="container py-6 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Your Projects</h1>
        <CreateProjectButton />
      </div>

      <ProjectList projects={projects} />
    </div>
  )
}
