"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Copy } from "lucide-react"
import type { Project } from "@/lib/projects"
import { useToast } from "@/hooks/use-toast"

export function ProjectHeader({ project }: { project: Project }) {
  const apiBaseUrl = project.baseUrl || `${process.env.NEXT_PUBLIC_APP_URL}/api/${project.id}`
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiBaseUrl)
    toast({
      title: "Copied to clipboard",
      description: "API base URL copied to clipboard",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold truncate text-neonBlue-700 dark:text-neonBlue-400">
            {project.name}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-neonBlue-200 hover:bg-neonBlue-50 dark:border-neonBlue-800 dark:hover:bg-neonBlue-900"
        >
          <Link href={`/projects/${project.id}/settings`}>
            <Settings className="h-4 w-4 mr-2 text-neonBlue-600 dark:text-neonBlue-400" />
            Settings
          </Link>
        </Button>
      </div>

      {project.description && <p className="text-muted-foreground text-sm">{project.description}</p>}

      <div className="bg-neonBlue-50 dark:bg-neonBlue-950/30 border border-neonBlue-200 dark:border-neonBlue-900 p-3 rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-neonBlue-700 dark:text-neonBlue-400">API Base URL:</p>
          <code className="text-xs bg-white dark:bg-gray-900 px-1 py-0.5 rounded block truncate border border-neonBlue-100 dark:border-neonBlue-900">
            {apiBaseUrl}
          </code>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="self-end sm:self-auto text-neonBlue-600 hover:text-neonBlue-700 hover:bg-neonBlue-50 dark:text-neonBlue-400 dark:hover:bg-neonBlue-900/50"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
      </div>
    </div>
  )
}
