import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { getProjectById } from "@/lib/projects"
import { getProjectApis } from "@/lib/api-actions"
import { getWebhooks } from "@/lib/webhook-actions"
import { CurlParser } from "@/components/curl-parser"
import { ApiTable } from "@/components/api-table"
import { WebhookTable } from "@/components/webhook-table"
import { ProjectHeader } from "@/components/projects/project-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  await requireAuth()

  const project = await getProjectById(params.id)
  if (!project) {
    notFound()
  }

  const apis = await getProjectApis(project.id)
  const webhooks = await getWebhooks(10)

  return (
    <div className="container py-6 md:py-8 px-4 md:px-6">
      <ProjectHeader project={project} />

      <div className="mt-6 md:mt-8">
        <CurlParser projectId={project.id} />
      </div>

      <div className="mt-8">
        <Tabs defaultValue="apis" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apis">API Endpoints</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          <TabsContent value="apis" className="mt-4">
            <ApiTable apis={apis} projectId={project.id} baseUrl={project.baseUrl} />
          </TabsContent>
          <TabsContent value="webhooks" className="mt-4">
            <WebhookTable webhooks={webhooks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
