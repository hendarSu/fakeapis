export function parseCurl(curlCommand: string) {
  // Basic curl command parsing
  const method = extractMethod(curlCommand)
  const url = extractUrl(curlCommand)
  const headers = extractHeaders(curlCommand)
  const body = extractBody(curlCommand)

  // Try to parse the body if it's JSON
  let parsedBody = null
  let responseExample = null

  if (body) {
    try {
      parsedBody = JSON.parse(body)
      // Create a simple response example based on the request
      responseExample = createResponseExample(parsedBody, method)
    } catch (e) {
      // Not JSON or invalid JSON
      parsedBody = body
    }
  }

  return {
    method,
    url,
    headers,
    body,
    parsedBody,
    responseExample,
  }
}

function extractMethod(curlCommand: string): string {
  const methodMatch = curlCommand.match(/-X\s+([A-Z]+)/i)
  if (methodMatch) {
    return methodMatch[1].toUpperCase()
  }

  // Check for data flags which imply POST
  if (curlCommand.includes("-d ") || curlCommand.includes("--data ") || curlCommand.includes("--data-raw ")) {
    return "POST"
  }

  return "GET"
}

function extractUrl(curlCommand: string): string {
  // This is a simplified version - a real implementation would be more robust
  const urlMatch =
    curlCommand.match(/curl\s+['"]?([^'">\s]+)['"]?/i) || curlCommand.match(/curl\s+.*?['"]([^'"]+)['"]/i)

  if (urlMatch && urlMatch[1]) {
    // Remove quotes if present
    return urlMatch[1].replace(/['"]/g, "")
  }

  return ""
}

function extractHeaders(curlCommand: string): Record<string, string> {
  const headers: Record<string, string> = {}
  const headerMatches = curlCommand.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/gi)

  for (const match of headerMatches) {
    if (match[1] && match[2]) {
      headers[match[1].trim()] = match[2].trim()
    }
  }

  return headers
}

function extractBody(curlCommand: string): string | null {
  // Look for --data, --data-raw, or -d flags
  const dataMatch =
    curlCommand.match(/(?:--data|-d)\s+['"](.+?)['"]/s) || curlCommand.match(/(?:--data-raw)\s+['"](.+?)['"]/s)

  if (dataMatch && dataMatch[1]) {
    return dataMatch[1]
  }

  return null
}

function createResponseExample(requestBody: any, method: string): any {
  if (method === "GET") {
    // For GET requests, create a simple response with the same structure
    return requestBody
  } else if (method === "POST") {
    // For POST requests, create a response with an id and success status
    return {
      id: "123e4567-e89b-12d3-a456-426614174000",
      success: true,
      data: requestBody,
      createdAt: new Date().toISOString(),
    }
  } else if (method === "PUT" || method === "PATCH") {
    // For PUT/PATCH requests, return updated object
    return {
      id: "123e4567-e89b-12d3-a456-426614174000",
      success: true,
      data: requestBody,
      updated: true,
      updatedAt: new Date().toISOString(),
    }
  } else if (method === "DELETE") {
    // For DELETE requests, return success message
    return {
      success: true,
      message: "Resource deleted successfully",
    }
  }

  // Default fallback
  return {
    success: true,
    data: requestBody,
  }
}
