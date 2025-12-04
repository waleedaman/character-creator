import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/characters`, { cache: "no-store" });
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

export async function POST(req: NextRequest) {
  try {
    // Support both JSON and multipart
    const contentType = req.headers.get("content-type") || "";
    let body: BodyInit;
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      body = form as any;
    } else {
      body = await req.text();
    }

    const res = await fetch(`${BACKEND_URL}/characters`, {
      method: "POST",
      headers: contentType.includes("multipart/form-data")
        ? undefined
        : { "content-type": contentType || "application/json" },
      body,
    });

    const buf = await res.arrayBuffer();
    const respType = res.headers.get("content-type") || "application/json";
    return new Response(buf, { status: res.status, headers: { "content-type": respType } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Proxy error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
