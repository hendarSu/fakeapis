"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, ExternalLink } from "lucide-react"
import { deleteFakeApi } from "@/lib/api-actions"
import { useToast } from "@/hooks/use-toast"

type FakeApi = {
  id: string
  name: string
  method: string
  path: string
  createdAt: string
  baseUrl?: string | null
}

export function ApiList({
  apis,
  projectId,
  baseUrl,
}: {
  apis: FakeApi[]
  projectId: string
  baseUrl?: string | null
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const getApiUrl = (api: FakeApi) => {
    if (baseUrl) {
      return `https://${baseUrl}${api.path}`
    }
    return `${window.location.origin}/api/${projectId}${api.path}`
  }

  const copyEndpoint = (api: FakeApi) => {
    navigator.clipboard.writeText(getApiUrl(api))
    toast({
      title: "Copied to clipboard",
      description: "API endpoint URL copied to clipboard",
    })
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading({ ...loading, [id]: true })
      await deleteFakeApi(id, projectId)
      toast({
        title: "API deleted",
        description: "The fake API has been deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete API:", error)
      toast({
        title: "Error",
        description: "Failed to delete the API",
        variant: "destructive",
      })
    } finally {
      setLoading({ ...loading, [id]: false })
    }
  }

  return (
    <Card className="border-neonBlue-100 dark:border-neonBlue-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-neonBlue-700 dark:text-neonBlue-400">Project APIs</CardTitle>
        <CardDescription>List of all APIs in this project</CardDescription>
      </CardHeader>
      <CardContent>
        {apis.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No APIs created yet</div>
        ) : (
          <div className="space-y-4">
            {apis.map((api) => (
              <div
                key={api.id}
                className="border border-neonBlue-100 dark:border-neonBlue-900 rounded-md p-3 space-y-2 hover:bg-neonBlue-50 dark:hover:bg-neonBlue-950/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h3 className="font-medium truncate text-neonBlue-700 dark:text-neonBlue-400">{api.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="bg-neonBlue-50 text-neonBlue-700 border-neonBlue-200 dark:bg-neonBlue-950/30 dark:text-neonBlue-400 dark:border-neonBlue-800"
                      >
                        {api.method}
                      </Badge>
                      <code className="text-xs bg-white dark:bg-gray-900 p-1 rounded truncate max-w-[200px] border border-neonBlue-100 dark:border-neonBlue-900">
                        {api.path}
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-1 self-end sm:self-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyEndpoint(api)}
                      className="text-neonBlue-600 hover:text-neonBlue-700 hover:bg-neonBlue-100 dark:text-neonBlue-400 dark:hover:bg-neonBlue-900/50"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy URL</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(getApiUrl(api), "_blank")}
                      className="text-neonBlue-600 hover:text-neonBlue-700 hover:bg-neonBlue-100 dark:text-neonBlue-400 dark:hover:bg-neonBlue-900/50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">Open API</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(api.id)} disabled={loading[api.id]}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Created: {new Date(api.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
