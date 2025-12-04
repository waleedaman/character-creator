import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(`${BACKEND_URL}/generate-script`, {
      method: "POST",
      headers: {
        "content-type": req.headers.get("content-type") || "application/json",
      },
      body,
    });

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "application/json";
    return new Response(buf, { status: res.status, headers: { "content-type": contentType } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Proxy error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
