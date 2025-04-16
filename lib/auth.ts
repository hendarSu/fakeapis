import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import * as jose from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// User type definition
export type User = {
  id: string
  email: string
  name: string | null
}

// Register a new user
export async function registerUser(email: string, password: string, name?: string): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existingUser.length > 0) {
      throw new Error("User already exists")
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Insert the new user
    await sql`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (${userId}, ${email}, ${passwordHash}, ${name || null})
    `

    // Create a default project for the user
    const projectId = uuidv4()
    await sql`
      INSERT INTO projects (id, name, description, user_id)
      VALUES (${projectId}, ${"Default Project"}, ${"Your default project"}, ${userId})
    `

    return {
      id: userId,
      email,
      name: name || null,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return null
  }
}

// Login a user
export async function loginUser(email: string, password: string): Promise<string | null> {
  try {
    // Find the user
    const users = await sql`
      SELECT id, email, name, password_hash
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return null
    }

    const user = users[0]

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      return null
    }

    // Generate JWT token using jose
    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error("Login error:", error)
    return null
  }
}

// Get the current user from the request
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Verify and decode the token using jose
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET)
      return {
        id: payload.id as string,
        email: payload.email as string,
        name: (payload.name as string) || null,
      }
    } catch (e) {
      console.error("Token verification failed:", e)
      return null
    }
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

// Middleware to require authentication
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

// Logout a user
export async function logoutUser() {
  cookies().delete("auth_token")
}
