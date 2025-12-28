import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

const toAbsoluteImage = (image?: any) => {
  if (typeof image !== "string") return image;
  const trimmed = image.trim();
  if (!trimmed) return image;
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const base = BACKEND_URL.replace(/\/+$/, "");
  const path = trimmed.replace(/^\/+/, "");
  return `${base}/${path}`;
};

const normalizeCharacters = (data: any) => {
  const normalizeOne = (c: any) => {
    if (!c || typeof c !== "object") return c;
    const img = toAbsoluteImage((c as any).image);
    return img === (c as any).image ? c : { ...c, image: img };
  };

  if (Array.isArray(data)) return data.map(normalizeOne);
  if (data?.characters && Array.isArray(data.characters)) {
    return { ...data, characters: data.characters.map(normalizeOne) };
  }
  return normalizeOne(data);
};

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/characters`, { cache: "no-store" });
    const contentType = res.headers.get("content-type") || "application/json";
    if (contentType.includes("application/json")) {
      const json = await res.json();
      const normalized = normalizeCharacters(json);
      return Response.json(normalized, { status: res.status });
    }

    const buf = await res.arrayBuffer();
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

    const respType = res.headers.get("content-type") || "application/json";
    if (respType.includes("application/json")) {
      const json = await res.json();
      const normalized = normalizeCharacters(json);
      return Response.json(normalized, { status: res.status });
    }

    const buf = await res.arrayBuffer();
    return new Response(buf, { status: res.status, headers: { "content-type": respType } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Proxy error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
