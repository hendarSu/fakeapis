"use server"

import { cookies } from "next/headers"
import { loginUser, registerUser } from "./auth"

// Login action
export async function loginAction({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    const token = await loginUser(email, password)

    if (!token) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Set the auth token as a cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Login action error:", error)
    return {
      success: false,
      error: "An error occurred during login",
    }
  }
}

// Register action
export async function registerAction({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}) {
  try {
    const user = await registerUser(email, password, name)

    if (!user) {
      return {
        success: false,
        error: "Registration failed",
      }
    }

    // Log the user in after registration
    return loginAction({ email, password })
  } catch (error: any) {
    console.error("Register action error:", error)
    return {
      success: false,
      error: error.message || "An error occurred during registration",
    }
  }
}

// Logout action
export async function logoutAction() {
  cookies().delete("auth_token")
  return { success: true }
}
