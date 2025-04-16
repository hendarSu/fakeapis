import { type NextRequest, NextResponse } from "next/server"
import { get } from "lodash"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "PUT")
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "PATCH")
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return handleRequest(request, params.path, "DELETE")
}

async function handleRequest(request: NextRequest, pathSegments: string[], requestMethod: string) {
  try {
    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json({ error: "Invalid API path" }, { status: 404 })
    }

    const projectIdentifier = pathSegments[0]
    const apiPath = `/${pathSegments.slice(1).join("/")}`
    const host = request.headers.get("host") || ""

    // Find the project by its identifier or by custom domain
    const projectResult = await sql`
      SELECT id FROM projects 
      WHERE id = ${projectIdentifier} 
      OR base_url = ${host}
    `

    if (projectResult.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const projectId = projectResult[0].id

    // Find the API that matches the path and method
    const apiResult = await sql`
      SELECT * FROM fake_apis 
      WHERE project_id = ${projectId}
      AND path = ${apiPath}
      AND (method = ${requestMethod} OR method = 'ANY')
    `

    if (apiResult.length === 0) {
      return NextResponse.json(
        { error: `API not found for path: ${apiPath} and method: ${requestMethod}` },
        { status: 404 },
      )
    }

    const api = apiResult[0]

    // Get dynamic fields for this API
    const fieldsResult = await sql`
      SELECT response_field_path, source_type, source_path
      FROM dynamic_fields
      WHERE api_id = ${api.id}
    `

    // Convert the dynamic fields to the expected format
    const dynamicFields = fieldsResult.reduce((acc: any, field: any) => {
      acc[field.response_field_path] = {
        source: field.source_type,
        path: field.source_path,
      }
      return acc
    }, {})

    // Parse request data
    const queryParams = Object.fromEntries(request.nextUrl.searchParams)
    const urlParams = extractUrlParams(api.path, apiPath)

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
    const responseTemplate = api.response_template || {}
    const responseData = JSON.parse(JSON.stringify(responseTemplate))

    // Apply dynamic fields
    if (dynamicFields) {
      for (const [fieldPath, { source, path }] of Object.entries(dynamicFields)) {
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

  // Extract parameters from path segments
  for (let i = 0; i < templateSegments.length && i < actualSegments.length; i++) {
    const templateSegment = templateSegments[i]

    // Check if this segment is a parameter (starts with : or enclosed in {})
    if (templateSegment.startsWith(":") || (templateSegment.startsWith("{") && templateSegment.endsWith("}"))) {
      // Extract the parameter name
      const paramName = templateSegment.startsWith(":")
        ? templateSegment.substring(1)
        : templateSegment.substring(1, templateSegment.length - 1)

      // Store the parameter value
      params[paramName] = actualSegments[i]
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
