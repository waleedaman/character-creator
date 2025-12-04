import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/characters/${id}`, { method: "DELETE" });
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
