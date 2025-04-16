import { type NextRequest, NextResponse } from "next/server"
import { get } from "lodash"
import { getFakeApiById } from "@/lib/api-actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id, "PUT")
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id, "PATCH")
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return handleRequest(request, params.id, "DELETE")
}

async function handleRequest(request: NextRequest, id: string, requestMethod: string) {
  try {
    // Get the API configuration from the database
    const api = await getFakeApiById(id)

    if (!api) {
      return NextResponse.json({ error: "API not found" }, { status: 404 })
    }

    // Check if the method matches
    if (api.method !== requestMethod && api.method !== "ANY") {
      return NextResponse.json({ error: `Method ${requestMethod} not allowed` }, { status: 405 })
    }

    // Parse request data
    const queryParams = Object.fromEntries(request.nextUrl.searchParams)
    const urlParams = extractUrlParams(api.path, request.nextUrl.pathname)

    let bodyParams = {}
    if (requestMethod !== "GET") {
      try {
        const contentType = request.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
          bodyParams = await request.json()
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          const formData = await request.formData()
          bodyParams = Object.fromEntries(formData)
        }
      } catch (e) {
        // Ignore body parsing errors
      }
    }

    // Create a deep copy of the response template
    const responseData = JSON.parse(JSON.stringify(api.responseTemplate || {}))

    // Apply dynamic fields
    if (api.dynamicFields) {
      for (const [fieldPath, { source, path }] of Object.entries(api.dynamicFields)) {
        let value

        if (source === "body") {
          value = get(bodyParams, path)
        } else if (source === "query") {
          value = get(queryParams, path)
        } else if (source === "params") {
          value = get(urlParams, path)
        }

        if (value !== undefined) {
          setNestedValue(responseData, fieldPath, value)
        }
      }
    }

    // Add headers if specified
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(api.headers || {}),
    }

    // Add a delay to simulate real API behavior (100-300ms)
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 100))

    return NextResponse.json(responseData, { headers })
  } catch (error) {
    console.error("Error handling fake API request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to extract URL parameters
function extractUrlParams(templatePath: string, actualPath: string): Record<string, string> {
  const params: Record<string, string> = {}

  // Split the paths into segments
  const templateSegments = templatePath.split("/").filter(Boolean)
  const actualSegments = actualPath.split("/").filter(Boolean)

  // Skip the "api/fake/[id]" part in the actual path
  const relevantActualSegments = actualSegments.slice(2)

  // Extract parameters from path segments
  for (let i = 0; i < templateSegments.length && i < relevantActualSegments.length; i++) {
    const templateSegment = templateSegments[i]

    // Check if this segment is a parameter (starts with : or enclosed in {})
    if (templateSegment.startsWith(":") || (templateSegment.startsWith("{") && templateSegment.endsWith("}"))) {
      // Extract the parameter name
      const paramName = templateSegment.startsWith(":")
        ? templateSegment.substring(1)
        : templateSegment.substring(1, templateSegment.length - 1)

      // Store the parameter value
      params[paramName] = relevantActualSegments[i]
    }
  }

  return params
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
