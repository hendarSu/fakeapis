"use server"

import { sql, snakeToCamel } from "./db"

// Get recent webhooks
export async function getWebhooks(limit = 10) {
  try {
    const result = await sql`
      SELECT 
        id, 
        timestamp, 
        headers, 
        body, 
        raw_body as "rawBody", 
        content_type as "contentType"
      FROM 
        webhooks
      ORDER BY 
        timestamp DESC
      LIMIT ${limit}
    `

    return result.map(snakeToCamel)
  } catch (error) {
    console.error("Failed to fetch webhooks:", error)
    return []
  }
}
