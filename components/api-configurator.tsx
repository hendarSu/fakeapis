"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createFakeApi } from "@/lib/api-actions"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ApiConfigurator({
  parsedData,
  onReset,
  projectId,
}: {
  parsedData: any
  onReset: () => void
  projectId: string
}) {
  const [apiName, setApiName] = useState("")
  const [responseTemplate, setResponseTemplate] = useState(JSON.stringify(parsedData.responseExample || {}, null, 2))
  const [dynamicFields, setDynamicFields] = useState<Record<string, { source: string; path: string }>>({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResponse, setTestResponse] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  const handleAddDynamicField = (fieldPath: string, source: string, paramPath: string) => {
    setDynamicFields({
      ...dynamicFields,
      [fieldPath]: { source, path: paramPath },
    })
  }

  const handleRemoveDynamicField = (fieldPath: string) => {
    const newDynamicFields = { ...dynamicFields }
    delete newDynamicFields[fieldPath]
    setDynamicFields(newDynamicFields)
  }

  const isValidJson = (json: string): boolean => {
    try {
      JSON.parse(json)
      return true
    } catch (e) {
      return false
    }
  }

  const generateExampleTemplate = (type: string) => {
    switch (type) {
      case "item":
        return JSON.stringify(
          {
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "Example Item",
            description: "This is an example item",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          null,
          2,
        )
      case "list":
        return JSON.stringify(
          {
            items: [
              {
                id: "123e4567-e89b-12d3-a456-426614174000",
                name: "Example Item 1",
                description: "This is the first example item",
              },
              {
                id: "456e7890-e12b-34d5-a678-426614174000",
                name: "Example Item 2",
                description: "This is the second example item",
              },
            ],
            pagination: {
              total: 2,
              page: 1,
              limit: 10,
            },
          },
          null,
          2,
        )
      case "error":
        return JSON.stringify(
          {
            error: true,
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: [
              {
                field: "email",
                message: "Email is required",
              },
            ],
          },
          null,
          2,
        )
      default:
        return responseTemplate
    }
  }

  const handleCreateApi = async () => {
    try {
      if (!apiName.trim()) {
        setError("API name is required")
        return
      }

      if (!isValidJson(responseTemplate)) {
        setError("Response template must be valid JSON")
        return
      }

      await createFakeApi({
        name: apiName,
        method: parsedData.method,
        path: parsedData.url,
        responseTemplate: JSON.parse(responseTemplate),
        dynamicFields,
        headers: parsedData.headers,
        projectId,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to create API. Please check your configuration.")
      console.error(err)
    }
  }

  const testResponseTemplate = async () => {
    try {
      if (!isValidJson(responseTemplate)) {
        setError("Response template must be valid JSON")
        return
      }

      setTestLoading(true)
      setTestResponse(null)

      // Simulate API response with a delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Parse the template and apply any transformations
      const template = JSON.parse(responseTemplate)

      // Add some sample dynamic values
      const sampleResponse = JSON.parse(JSON.stringify(template))

      // Apply sample values for dynamic fields
      if (Object.keys(dynamicFields).length > 0) {
        for (const [fieldPath, { source, path }] of Object.entries(dynamicFields)) {
          // Set a sample value based on the source type
          let sampleValue
          if (source === "body") {
            sampleValue = "sample-body-value"
          } else if (source === "query") {
            sampleValue = "sample-query-value"
          } else if (source === "params") {
            sampleValue = "sample-param-value"
          }

          if (sampleValue) {
            setNestedValue(sampleResponse, fieldPath, sampleValue)
          }
        }
      }

      setTestResponse(sampleResponse)
    } catch (err) {
      setError("Failed to test response template. Please check your JSON format.")
      console.error(err)
    } finally {
      setTestLoading(false)
    }
  }

  // Helper function to set a nested value in an object
  function setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".")
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]

      // Create the nested object if it doesn't exist
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {}
      }

      current = current[key]
    }

    // Set the value at the final key
    const lastKey = keys[keys.length - 1]
    current[lastKey] = value
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">Your fake API has been created successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">API Details</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="sm:col-span-1">
              <Badge variant="outline">{parsedData.method}</Badge>
            </div>
            <div className="sm:col-span-3">
              <code className="text-sm bg-muted p-1 rounded block truncate">{parsedData.url}</code>
            </div>
          </div>
          <div>
            <Label htmlFor="api-name">API Name</Label>
            <Input
              id="api-name"
              value={apiName}
              onChange={(e) => setApiName(e.target.value)}
              placeholder="my-fake-api"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="response" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic Fields</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="response" className="space-y-4">
          <div>
            <Label htmlFor="response-template">Response JSON Template</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Define the JSON structure that will be returned by your fake API. You can use dynamic fields to populate
              values from requests.
            </p>
          </div>
          <div className="mb-4">
            <Label htmlFor="template-selector" className="mb-2 block">
              Example Templates
            </Label>
            <Select onValueChange={(value) => setResponseTemplate(generateExampleTemplate(value))}>
              <SelectTrigger id="template-selector">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item">Single Item</SelectItem>
                <SelectItem value="list">Item List</SelectItem>
                <SelectItem value="error">Error Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            id="response-template"
            value={responseTemplate}
            onChange={(e) => setResponseTemplate(e.target.value)}
            className="font-mono text-sm min-h-[200px] sm:min-h-[300px]"
          />
          {!isValidJson(responseTemplate) && responseTemplate.trim() !== "" && (
            <p className="text-red-500 text-sm">Invalid JSON format</p>
          )}
        </TabsContent>

        <TabsContent value="dynamic">
          <DynamicFieldsConfigurator
            responseTemplate={responseTemplate}
            parsedData={parsedData}
            dynamicFields={dynamicFields}
            onAdd={handleAddDynamicField}
            onRemove={handleRemoveDynamicField}
          />
        </TabsContent>

        <TabsContent value="headers">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Response Headers</h3>
            <div className="border rounded-md p-4">
              {Object.entries(parsedData.headers || {}).length > 0 ? (
                <div className="grid gap-2">
                  {Object.entries(parsedData.headers || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="font-medium truncate">{key}:</div>
                      <div className="text-muted-foreground truncate">{value as string}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No headers found in the curl command</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Test Your API Response</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Preview how your API will respond before creating it. Dynamic fields will be populated with sample values.
            </p>
            <Button
              onClick={testResponseTemplate}
              disabled={testLoading || !isValidJson(responseTemplate)}
              className="mb-4 w-full sm:w-auto"
            >
              {testLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Response"
              )}
            </Button>

            {testResponse && (
              <div className="border rounded-md p-4 bg-muted">
                <h4 className="text-sm font-medium mb-2">Response Preview:</h4>
                <pre className="text-sm overflow-auto max-h-[200px] sm:max-h-[300px]">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
        <Button variant="outline" onClick={onReset} className="order-2 sm:order-1">
          Back
        </Button>
        <Button onClick={handleCreateApi} className="order-1 sm:order-2">
          Create Fake API
        </Button>
      </div>
    </div>
  )
}

function DynamicFieldsConfigurator({
  responseTemplate,
  parsedData,
  dynamicFields,
  onAdd,
  onRemove,
}: {
  responseTemplate: string
  parsedData: any
  dynamicFields: Record<string, { source: string; path: string }>
  onAdd: (fieldPath: string, source: string, paramPath: string) => void
  onRemove: (fieldPath: string) => void
}) {
  const [selectedField, setSelectedField] = useState("")
  const [selectedSource, setSelectedSource] = useState<"body" | "query" | "params">("body")
  const [selectedSourcePath, setSelectedSourcePath] = useState("")

  // Extract paths from response template
  const extractPaths = (obj: any, prefix = "") => {
    let paths: string[] = []

    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((key) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === "object" && obj[key] !== null) {
          paths = [...paths, newPrefix, ...extractPaths(obj[key], newPrefix)]
        } else {
          paths.push(newPrefix)
        }
      })
    }

    return paths
  }

  let responsePaths: string[] = []
  try {
    const responseObj = JSON.parse(responseTemplate)
    responsePaths = extractPaths(responseObj)
  } catch (e) {
    // Handle JSON parse error
  }

  const handleAddField = () => {
    if (selectedField && selectedSourcePath) {
      onAdd(selectedField, selectedSource, selectedSourcePath)
      setSelectedField("")
      setSelectedSourcePath("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Configure Dynamic Fields</h3>
        <p className="text-muted-foreground text-sm">Map fields in your response to values from the request</p>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="response-field">Response Field</Label>
            <select
              id="response-field"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a field</option>
              {responsePaths.map((path) => (
                <option key={path} value={path}>
                  {path}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="source-type">Source Type</Label>
            <select
              id="source-type"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="body">Request Body</option>
              <option value="query">Query Parameters</option>
              <option value="params">URL Parameters</option>
            </select>
          </div>

          <div>
            <Label htmlFor="source-path">Source Path</Label>
            <Input
              id="source-path"
              value={selectedSourcePath}
              onChange={(e) => setSelectedSourcePath(e.target.value)}
              placeholder={selectedSource === "body" ? "data.user.id" : selectedSource === "query" ? "filter" : "id"}
            />
          </div>

          <Button
            onClick={handleAddField}
            disabled={!selectedField || !selectedSourcePath}
            className="w-full sm:w-auto"
          >
            Add Mapping
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Dynamic Field Mappings</h3>
        {Object.keys(dynamicFields).length > 0 ? (
          <div className="border rounded-md divide-y">
            {Object.entries(dynamicFields).map(([fieldPath, { source, path }]) => (
              <div key={fieldPath} className="p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <div className="font-medium truncate">{fieldPath}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    ← {source}.{path}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemove(fieldPath)} className="self-end sm:self-auto">
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No dynamic fields configured yet</p>
        )}
      </div>
    </div>
  )
}
