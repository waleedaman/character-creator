import type { ScriptChunk } from "./types";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export async function postGenerateVideo(input: {
  script: ScriptChunk[];
  firstFrame?: string;
  characters?: Array<{ name: string; description?: string; image?: string }>;
  model?: string;
}): Promise<Array<{ time: string; url: string; details?: any }>> {
  const res = await fetch(`${BACKEND_BASE}/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Generate video failed (${res.status}): ${txt || res.statusText}`);
  }
  const data = await res.json();
  return (data?.clips ?? []) as Array<{ time: string; url: string; details?: any }>;
}
