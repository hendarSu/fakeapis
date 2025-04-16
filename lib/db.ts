import { neon } from "@neondatabase/serverless"

// Create a SQL client with the pooled connection
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to convert snake_case database columns to camelCase
export function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel)
  }

  return Object.keys(obj).reduce((result: any, key) => {
    // Convert key from snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

    // Convert value if it's an object or array
    result[camelKey] = snakeToCamel(obj[key])

    return result
  }, {})
}
