"use server"

import { v4 as uuidv4 } from "uuid"
import { sql, snakeToCamel } from "./db"
import { requireAuth } from "./auth"
import { revalidatePath } from "next/cache"

export type Project = {
  id: string
  name: string
  description: string | null
  baseUrl: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

// Get all projects for the current user
export async function getUserProjects(): Promise<Project[]> {
  const user = await requireAuth()

  try {
    const result = await sql`
      SELECT *
      FROM projects
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    return result.map(snakeToCamel)
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return []
  }
}

// Get a project by ID
export async function getProjectById(id: string): Promise<Project | null> {
  const user = await requireAuth()

  try {
    const result = await sql`
      SELECT *
      FROM projects
      WHERE id = ${id} AND user_id = ${user.id}
    `

    if (result.length === 0) {
      return null
    }

    return snakeToCamel(result[0])
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return null
  }
}

// Create a new project
export async function createProject(data: {
  name: string
  description?: string
  baseUrl?: string
}): Promise<Project | null> {
  const user = await requireAuth()

  try {
    const projectId = uuidv4()
    const now = new Date()

    await sql`
      INSERT INTO projects (
        id, 
        name, 
        description, 
        base_url,
        user_id,
        created_at,
        updated_at
      ) VALUES (
        ${projectId}, 
        ${data.name}, 
        ${data.description || null}, 
        ${data.baseUrl || null},
        ${user.id},
        ${now},
        ${now}
      )
    `

    revalidatePath("/dashboard")
    return {
      id: projectId,
      name: data.name,
      description: data.description || null,
      baseUrl: data.baseUrl || null,
      userId: user.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }
  } catch (error) {
    console.error("Failed to create project:", error)
    return null
  }
}

// Update a project
export async function updateProject(
  id: string,
  data: {
    name?: string
    description?: string
    baseUrl?: string
  },
): Promise<boolean> {
  const user = await requireAuth()

  try {
    // Check if the project belongs to the user
    const project = await getProjectById(id)
    if (!project) {
      return false
    }

    const updates = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = $1")
      values.push(data.name)
    }

    if (data.description !== undefined) {
      updates.push(`description = $${values.length + 1}`)
      values.push(data.description)
    }

    if (data.baseUrl !== undefined) {
      updates.push(`base_url = $${values.length + 1}`)
      values.push(data.baseUrl)
    }

    if (updates.length === 0) {
      return true // Nothing to update
    }

    updates.push(`updated_at = $${values.length + 1}`)
    values.push(new Date())

    // Add the project ID and user ID to the values
    values.push(id)
    values.push(user.id)

    const updateQuery = `
      UPDATE projects 
      SET ${updates.join(", ")} 
      WHERE id = $${values.length - 1} AND user_id = $${values.length}
    `

    await sql.unsafe(updateQuery, values)

    revalidatePath("/dashboard")
    revalidatePath(`/projects/${id}`)
    return true
  } catch (error) {
    console.error("Failed to update project:", error)
    return false
  }
}

// Delete a project
export async function deleteProject(id: string): Promise<boolean> {
  const user = await requireAuth()

  try {
    // Check if the project belongs to the user
    const project = await getProjectById(id)
    if (!project) {
      return false
    }

    await sql`
      DELETE FROM projects
      WHERE id = ${id} AND user_id = ${user.id}
    `

    revalidatePath("/dashboard")
    return true
  } catch (error) {
    console.error("Failed to delete project:", error)
    return false
  }
}
