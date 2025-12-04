"use client";

import type { Character, ScriptChunk } from "../lib/types";
import { toDataUrl } from "../lib/media";

export const keyOfName = (s?: string | null) => (s ?? "").trim().toLowerCase();

export async function buildCharImageMap(chars: Character[]): Promise<Record<string, string | undefined>> {
  const map: Record<string, string | undefined> = {};
  await Promise.all(
    chars.map(async (c) => {
      const k = keyOfName(c.name);
      if (!k) return;
      map[k] = await toDataUrl(c.image ?? undefined);
    })
  );
  return map;
}

export function normalizeScriptResponse(data: any): Array<Record<string, any>> {
  if (Array.isArray(data)) return data as any;
  if (data?.script && Array.isArray(data.script)) return data.script;
  if (typeof data === "object" && data !== null) return [data];
  return [{ value: String(data) }];
}

export function buildScriptChunks(
  scriptRows: Array<Record<string, any>>,
  characters: Character[],
  charImages: Record<string, string | undefined>
): ScriptChunk[] {
  return (scriptRows || []).map((r) => {
    const base: ScriptChunk = {
      time: String((r as any).time ?? (r as any).t ?? (r as any).timecode ?? "0-8seconds"),
      audio: (r as any).audio ?? (r as any).voice ?? undefined,
      visuals: (r as any).visuals ?? (r as any).action ?? undefined,
    };

    let rowChars: any = (r as any).characters;
    if (typeof rowChars === "string") {
      try {
        rowChars = JSON.parse(rowChars);
      } catch {
        rowChars = undefined;
      }
    }

    const chunkChars: Array<{ name: string; description?: string; image?: string }> =
      Array.isArray(rowChars) && rowChars.length > 0
        ? rowChars.map((rc: any) => {
            const nm = String(rc?.name ?? rc).trim();
            const k = keyOfName(nm);
            return {
              name: nm,
              description: rc?.description ?? characters.find((c) => keyOfName(c.name) === k)?.description ?? undefined,
              image: charImages[k],
            };
          })
        : characters.map((c) => ({
            name: c.name ?? "",
            description: c.description ?? undefined,
            image: charImages[keyOfName(c.name)],
          }));

    return { ...base, characters: chunkChars };
  });
}
