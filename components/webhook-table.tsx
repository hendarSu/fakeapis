"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Search, RefreshCw } from "lucide-react"
import { getWebhooks } from "@/lib/webhook-actions"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Webhook = {
  id: string
  timestamp: string
  contentType: string
  headers: Record<string, string>
  body: any
  rawBody: string
}

export function WebhookTable({ webhooks: initialWebhooks }: { webhooks: Webhook[] }) {
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null)

  const loadWebhooks = async () => {
    try {
      setLoading(true)
      const data = await getWebhooks()
      setWebhooks(data)
    } catch (error) {
      console.error("Failed to load webhooks:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWebhooks = webhooks.filter(
    (webhook) =>
      webhook.contentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webhook.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neonBlue-700 dark:text-neonBlue-400">Captured Webhooks</h2>
        <div className="flex gap-2 items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search webhooks..."
              className="pl-8 border-neonBlue-200 dark:border-neonBlue-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadWebhooks}
            disabled={loading}
            className="border-neonBlue-200 hover:bg-neonBlue-50 dark:border-neonBlue-800 dark:hover:bg-neonBlue-900/50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      {webhooks.length === 0 ? (
        <div className="text-center py-8 border rounded-md text-muted-foreground">
          No webhooks captured yet. Send requests to your webhook endpoint to see them here.
        </div>
      ) : filteredWebhooks.length === 0 ? (
        <div className="text-center py-8 border rounded-md text-muted-foreground">
          No webhooks match your search criteria.
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-neonBlue-50 dark:bg-neonBlue-950/30">
              <TableRow>
                <TableHead className="w-[180px]">Content Type</TableHead>
                <TableHead>ID</TableHead>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWebhooks.map((webhook) => (
                <TableRow key={webhook.id} className="hover:bg-neonBlue-50 dark:hover:bg-neonBlue-950/30">
                  <TableCell>
                    <Badge variant="outline">{webhook.contentType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[200px]">{webhook.id}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(webhook.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedWebhook(webhook)}
                          className="text-neonBlue-600 hover:text-neonBlue-700 hover:bg-neonBlue-100 dark:text-neonBlue-400 dark:hover:bg-neonBlue-900/50"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Webhook Details</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="body">
                          <TabsList>
                            <TabsTrigger value="body">Body</TabsTrigger>
                            <TabsTrigger value="headers">Headers</TabsTrigger>
                            <TabsTrigger value="raw">Raw</TabsTrigger>
                          </TabsList>
                          <TabsContent value="body" className="mt-4">
                            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                              {selectedWebhook && JSON.stringify(selectedWebhook.body, null, 2)}
                            </pre>
                          </TabsContent>
                          <TabsContent value="headers" className="mt-4">
                            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                              {selectedWebhook && JSON.stringify(selectedWebhook.headers, null, 2)}
                            </pre>
                          </TabsContent>
                          <TabsContent value="raw" className="mt-4">
                            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] whitespace-pre-wrap break-all">
                              {selectedWebhook && selectedWebhook.rawBody}
                            </pre>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
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
