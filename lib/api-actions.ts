"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { sql, snakeToCamel } from "./db"
import { requireAuth } from "./auth"

// Get all fake APIs for a project
export async function getProjectApis(projectId: string) {
  await requireAuth()

  try {
    const result = await sql`
      SELECT 
        fa.id, 
        fa.name, 
        fa.method, 
        fa.path, 
        fa.created_at as "createdAt",
        p.base_url as "baseUrl"
      FROM 
        fake_apis fa
      JOIN
        projects p ON fa.project_id = p.id
      WHERE 
        fa.project_id = ${projectId}
      ORDER BY 
        fa.created_at DESC
    `

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      method: row.method,
      path: row.path,
      createdAt: row.createdAt,
      baseUrl: row.baseUrl,
    }))
  } catch (error) {
    console.error("Failed to fetch APIs:", error)
    return []
  }
}

// Get a single fake API by ID with its dynamic fields
export async function getFakeApiById(id: string) {
  await requireAuth()

  try {
    // Get the API details
    const apiResult = await sql`
      SELECT 
        fa.*,
        p.base_url as "baseUrl"
      FROM 
        fake_apis fa
      JOIN
        projects p ON fa.project_id = p.id
      WHERE 
        fa.id = ${id}
    `

    if (apiResult.length === 0) {
      return null
    }

    const api = snakeToCamel(apiResult[0])

    // Get the dynamic fields for this API
    const fieldsResult = await sql`
      SELECT 
        response_field_path, 
        source_type, 
        source_path
      FROM 
        dynamic_fields
      WHERE 
        api_id = ${id}
    `

    // Convert the dynamic fields to the expected format
    const dynamicFields = fieldsResult.reduce((acc: any, field: any) => {
      acc[field.response_field_path] = {
        source: field.source_type,
        path: field.source_path,
      }
      return acc
    }, {})

    return {
      ...api,
      dynamicFields,
    }
  } catch (error) {
    console.error("Failed to fetch API by ID:", error)
    return null
  }
}

// Create a new fake API
export async function createFakeApi(apiData: {
  name: string
  method: string
  path: string
  responseTemplate: any
  dynamicFields: Record<string, { source: string; path: string }>
  headers?: Record<string, string>
  projectId: string
}) {
  await requireAuth()

  try {
    const apiId = uuidv4()

    // Insert the API record
    await sql`
      INSERT INTO fake_apis (
        id, 
        name, 
        method, 
        path, 
        response_template, 
        headers,
        project_id
      ) VALUES (
        ${apiId}, 
        ${apiData.name}, 
        ${apiData.method}, 
        ${apiData.path}, 
        ${JSON.stringify(apiData.responseTemplate)}, 
        ${apiData.headers ? JSON.stringify(apiData.headers) : null},
        ${apiData.projectId}
      )
    `

    // Insert the dynamic fields
    if (apiData.dynamicFields && Object.keys(apiData.dynamicFields).length > 0) {
      for (const [fieldPath, { source, path }] of Object.entries(apiData.dynamicFields)) {
        await sql`
          INSERT INTO dynamic_fields (
            id,
            api_id, 
            response_field_path, 
            source_type, 
            source_path
          ) VALUES (
            ${uuidv4()},
            ${apiId}, 
            ${fieldPath}, 
            ${source}, 
            ${path}
          )
        `
      }
    }

    revalidatePath(`/projects/${apiData.projectId}`)
    return { id: apiId, ...apiData }
  } catch (error) {
    console.error("Failed to create API:", error)
    throw new Error("Failed to create API")
  }
}

// Delete a fake API
export async function deleteFakeApi(id: string, projectId: string) {
  await requireAuth()

  try {
    // The dynamic_fields will be automatically deleted due to the ON DELETE CASCADE constraint
    await sql`
      DELETE FROM fake_apis WHERE id = ${id}
    `

    revalidatePath(`/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete API:", error)
    throw new Error("Failed to delete API")
  }
}
