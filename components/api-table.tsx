"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Copy, ExternalLink, Search } from "lucide-react"
import { deleteFakeApi } from "@/lib/api-actions"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type FakeApi = {
  id: string
  name: string
  method: string
  path: string
  createdAt: string
  baseUrl?: string | null
}

export function ApiTable({
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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedApi, setSelectedApi] = useState<FakeApi | null>(null)

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

  const filteredApis = apis.filter(
    (api) =>
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.method.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neonBlue-700 dark:text-neonBlue-400">API Endpoints</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search APIs..."
            className="pl-8 border-neonBlue-200 dark:border-neonBlue-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {apis.length === 0 ? (
        <div className="text-center py-8 border rounded-md text-muted-foreground">
          No APIs created yet. Use the form above to create your first API.
        </div>
      ) : filteredApis.length === 0 ? (
        <div className="text-center py-8 border rounded-md text-muted-foreground">
          No APIs match your search criteria.
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-neonBlue-50 dark:bg-neonBlue-950/30">
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-[100px]">Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="w-[180px]">Created</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApis.map((api) => (
                <TableRow key={api.id} className="hover:bg-neonBlue-50 dark:hover:bg-neonBlue-950/30">
                  <TableCell className="font-medium text-neonBlue-700 dark:text-neonBlue-400">{api.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-neonBlue-50 text-neonBlue-700 border-neonBlue-200 dark:bg-neonBlue-950/30 dark:text-neonBlue-400 dark:border-neonBlue-800"
                    >
                      {api.method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-white dark:bg-gray-900 p-1 rounded truncate max-w-[200px] border border-neonBlue-100 dark:border-neonBlue-900">
                      {api.path}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(api.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedApi(api)}
                            className="text-neonBlue-600 hover:text-neonBlue-700 hover:bg-neonBlue-100 dark:text-neonBlue-400 dark:hover:bg-neonBlue-900/50"
                          >
                            <Search className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>API Details: {selectedApi?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
                              <div className="sm:col-span-1">
                                <Badge variant="outline">{selectedApi?.method}</Badge>
                              </div>
                              <div className="sm:col-span-3">
                                <code className="text-sm bg-muted p-1 rounded block truncate">{selectedApi?.path}</code>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Full URL:</h4>
                              <code className="text-sm bg-muted p-2 rounded block overflow-x-auto">
                                {selectedApi && getApiUrl(selectedApi)}
                              </code>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Created:</h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedApi && new Date(selectedApi.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(api.id)}
                        disabled={loading[api.id]}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
