import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

function getUrlHost(request: NextRequest): string {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch {
      // ignore
    }
  }
  const host = request.headers.get("host");
  if (host) return host;
  const urlValue =
    process.env.VERCEL_ENV === "production"
      ? process.env.NEXT_PUBLIC_URL!
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
  return new URL(urlValue).host;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1] as string,
      domain: getUrlHost(request),
    });
    const userFid = payload.sub;
    return NextResponse.json({
      success: true,
      user: {
        fid: userFid,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      },
    });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 500 });
    }
    throw e;
  }
}
