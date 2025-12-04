"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PrimaryButton from "../components/PrimaryButton";
import ScriptEditor from "./ScriptEditor";
import SelectedCharacters from "./SelectedCharacters";
import type { Character } from "../lib/types";
import { fileToDataUrl } from "../lib/media";
import { postGenerateScript } from "../lib/scriptApi";
import { postGenerateVideo } from "../lib/videoApi";
import { buildCharImageMap, buildScriptChunks, normalizeScriptResponse, keyOfName } from "./utils";

export default function GenerateVideoPage() {
  const search = useSearchParams();
  const idsParam = search.get("ids") || "";
  const ids = idsParam ? idsParam.split(",").map((s) => s.trim()) : [];

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scriptJson, setScriptJson] = useState<any | null>(null);
  const [scriptRows, setScriptRows] = useState<Array<Record<string, any>>>([]);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [promptCollapsed, setPromptCollapsed] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const promptRef = useRef<HTMLTextAreaElement | null>(null);
  const scriptRef = useRef<HTMLDivElement | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoClips, setVideoClips] = useState<Array<{ time: string; url: string; details?: any }>>([]);

  // Load selected characters
  useEffect(() => {
    if (!ids.length) return;
    setLoading(true);
    fetch("/api/characters")
      .then((res) => res.json())
      .then((data) => {
        const list: Character[] = Array.isArray(data) ? data : data?.characters ?? [];
        setCharacters(list.filter((c) => ids.includes(String(c.id ?? c.name ?? ""))));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [idsParam]);

  // Preview selected image for firstFrame
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }, [file]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null);

  const onGenerateScript = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!prompt && !file) {
      window.alert("Add a prompt or an image to start from.");
      return;
    }
    setScriptError(null);
    setScriptLoading(true);
    try {
      const payload: any = { prompt, characters: characters.map((c) => ({ name: c.name, description: c.description })) };
      if (file) payload.file = { name: file.name, type: file.type, dataUrl: await fileToDataUrl(file) };
      const data = await postGenerateScript(payload);
      setScriptJson(data);
      setScriptRows(normalizeScriptResponse(data));
      setPromptCollapsed(true);
      setScriptExpanded(true);
      setTimeout(() => {
        scriptRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        const firstInput = scriptRef.current?.querySelector("input") as HTMLInputElement | null;
        firstInput?.focus();
      }, 60);
    } catch (err: any) {
      setScriptError(err?.message ?? String(err));
      window.alert("Failed to generate script: " + (err?.message ?? String(err)));
    } finally {
      setScriptLoading(false);
    }
  };

  const onGenerateVideo = async () => {
    try {
      setVideoLoading(true);
      const charImages = await buildCharImageMap(characters);
      const script = buildScriptChunks(scriptRows, characters, charImages);
      const enrichedChars = await Promise.all(
        characters.map(async (c) => ({
          name: c.name ?? "",
          description: c.description ?? undefined,
          image: charImages[keyOfName(c.name)],
        }))
      );
      const firstFrame = preview ?? undefined;
      const clips = await postGenerateVideo({ script, firstFrame, characters: enrichedChars });
      setVideoClips(clips);
      if (clips && clips[0]?.url) window.open(clips[0].url, "_blank");
    } catch (err: any) {
      console.error(err);
      window.alert("Generate video failed: " + (err?.message ?? String(err)));
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <form onSubmit={onGenerateScript} className="w-full max-w-3xl space-y-6 rounded-md bg-card p-8 shadow-sm border" style={{ borderColor: "var(--border)" }}>
        <h1 className="mb-0 text-2xl font-semibold">Generate video</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={`md:col-span-2 transition-[max-height] duration-300 ${promptCollapsed ? "max-h-0 overflow-hidden" : "max-h-[2000px]"}`} aria-hidden={promptCollapsed}>
            <label className="mb-2 block text-sm font-medium">Prompt</label>
            <textarea ref={promptRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the scene, action, style..." className="h-32 w-full rounded-md border px-3 py-2 text-sm" />

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Start from image (optional)</label>
              <input name="file" type="file" accept="image/*" onChange={onFileChange} />
              {preview && <img src={preview} alt="preview" className="mt-3 max-h-48 w-auto rounded-md object-contain" />}
            </div>

            <div className="mt-6">
              <h2 className="mb-2 text-sm font-medium">Selected characters</h2>
              <SelectedCharacters characters={characters} />
            </div>

            <div className="mt-6">
              <PrimaryButton type="submit" disabled={scriptLoading} className="rounded-md bg-accent px-4 py-2 text-white disabled:opacity-60">
                {scriptLoading ? "Generating script..." : "Generate script"}
              </PrimaryButton>
            </div>
          </div>
          <div className="md:col-span-1" />
        </div>
      </form>

      <div className={`w-full max-w-3xl mt-6 space-y-6 rounded-md bg-card p-6 shadow-sm border transition-all duration-200 ${scriptExpanded ? "opacity-100 scale-100" : "opacity-95 scale-95"}`} style={{ borderColor: "var(--border)" }}>
        <h3 className="text-sm font-medium">Generated script</h3>
        {scriptLoading && <div className="text-sm text-muted-foreground">Generating script...</div>}
        {scriptError && <div className="text-sm text-red-600">{scriptError}</div>}
        {!scriptLoading && !scriptJson && <div className="text-sm text-muted-foreground">No script yet. Click "Generate script".</div>}

        {scriptJson && (
          <div ref={scriptRef} className={scriptExpanded ? "mt-1 overflow-auto transition-all duration-300" : "mt-1 overflow-auto"}>
            <ScriptEditor rows={scriptRows} setRows={setScriptRows} />
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => { setPromptCollapsed(false); setScriptExpanded(false); setTimeout(() => promptRef.current?.focus(), 80); }} className="rounded-md border px-3 py-1 text-sm">Edit prompt</button>
              <button type="button" onClick={onGenerateVideo} className="rounded-md bg-emerald-600 px-4 py-2 text-white">{videoLoading ? "Generating video..." : "Generate video"}</button>
            </div>
          </div>
        )}

        {videoClips.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium">Generated clips</h4>
            <ul className="mt-2 space-y-2">
              {videoClips.map((c, i) => (
                <li key={i} className="text-sm">
                  <a href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{c.time} — Open clip</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
 

