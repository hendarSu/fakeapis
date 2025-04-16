"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getWebhooks } from "@/lib/webhook-actions"

type Webhook = {
  id: string
  timestamp: string
  contentType: string
  headers: Record<string, string>
  body: any
  rawBody: string
}

export function WebhookList() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    loadWebhooks()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Captured Webhooks</CardTitle>
        <CardDescription>Recent webhooks received by your webhook endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No webhooks captured yet</div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{webhook.contentType}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(webhook.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                              {JSON.stringify(webhook.body, null, 2)}
                            </pre>
                          </TabsContent>
                          <TabsContent value="headers" className="mt-4">
                            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                              {JSON.stringify(webhook.headers, null, 2)}
                            </pre>
                          </TabsContent>
                          <TabsContent value="raw" className="mt-4">
                            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] whitespace-pre-wrap break-all">
                              {webhook.rawBody}
                            </pre>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground truncate">ID: {webhook.id}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={loadWebhooks}>
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
