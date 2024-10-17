import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log("Middleware executed for path:", path)

  // Check if the path starts with /api/ but not /api/auth/
  if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
    const token = await getToken({ req: request })

    // If the user is not authenticated, return a 401 Unauthorized response
    if (!token) {
      console.log("Authentication failed for path:", path)
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }
    console.log("Authentication successful for path:", path)
  }

  // Continue with the request if authenticated or not an API route
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}