import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { sql } from "@/lib/db"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get("host") || ""

  // Skip middleware for Next.js internal routes and static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/auth") || pathname.includes(".")) {
    return NextResponse.next()
  }

  // Check if this is a custom domain request
  if (host !== process.env.NEXT_PUBLIC_APP_DOMAIN && process.env.NEXT_PUBLIC_APP_DOMAIN) {
    // Look up the project by custom domain
    try {
      const result = await sql`
        SELECT id FROM projects WHERE base_url = ${host}
      `

      if (result.length > 0) {
        const projectId = result[0].id

        // Rewrite all requests to the API route
        if (!pathname.startsWith("/api/")) {
          const url = request.nextUrl.clone()
          url.pathname = `/api/${projectId}${pathname}`
          return NextResponse.rewrite(url)
        }
      }
    } catch (error) {
      console.error("Middleware error:", error)
    }
  }

  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
