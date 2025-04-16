import { requireAuth } from "@/lib/auth"
import { CreateProjectForm } from "@/components/projects/create-project-form"

export default async function NewProjectPage() {
  await requireAuth()

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <CreateProjectForm />
    </div>
  )
}
