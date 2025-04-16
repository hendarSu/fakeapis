import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const id = uuidv4()
    const contentType = request.headers.get("content-type") || ""
    const headers = Object.fromEntries(request.headers.entries())

    // Get the raw body as text
    const rawBody = await request.text()

    // Try to parse the body as JSON if it's a JSON content type
    let parsedBody = null
    if (contentType.includes("application/json")) {
      try {
        parsedBody = JSON.parse(rawBody)
      } catch (e) {
        // If parsing fails, leave parsedBody as null
      }
    }

    // Store the webhook in the database
    await sql`
      INSERT INTO webhooks (
        id, 
        timestamp, 
        headers, 
        raw_body, 
        body, 
        content_type
      ) VALUES (
        ${id}, 
        NOW(), 
        ${JSON.stringify(headers)}, 
        ${rawBody}, 
        ${parsedBody ? JSON.stringify(parsedBody) : null}, 
        ${contentType}
      )
    `

    return NextResponse.json({
      success: true,
      message: "Webhook received",
      id,
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
