import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const auth = req.headers.get("authorization");
    const expected = `Basic ${Buffer.from(`admin:${process.env.ADMIN_PASSWORD}`).toString("base64")}`;
    if (auth !== expected) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Seoul Glow Admin"' },
      });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
