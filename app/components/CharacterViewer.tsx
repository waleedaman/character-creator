"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiChevronRight, FiEdit, FiTrash2 } from "react-icons/fi";
import ExpandableCircleButton from "./ExpandableCircleButton";

type Character = {
  id?: string | number;
  name?: string;
  description?: string;
  image?: string | null; // base64 or URL
};

export default function CharacterViewer() {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelWidthPx, setPanelWidthPx] = useState<number>(384); // default matches w-96

  // Fetch helper to get characters from the API proxy
  const fetchCharacters = () => {
    setLoading(true);
    setError(null);
    fetch("/api/characters")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCharacters(data);
        else if (data?.characters) setCharacters(data.characters);
        else setCharacters([]);
      })
      .catch((err: any) => setError(err?.message || String(err)))
      .finally(() => setLoading(false));
  };

  // Load when viewer opens
  useEffect(() => {
    if (!open) return;
    fetchCharacters();
  }, [open]);

  // Live-refresh when characters change elsewhere (e.g., after save)
  useEffect(() => {
    const onChanged = (_e: Event) => {
      if (open) fetchCharacters();
    };
    window.addEventListener("characters:changed", onChanged);
    return () => window.removeEventListener("characters:changed", onChanged);
  }, [open]);

  // Focus management and Escape to close when panel is open
  useEffect(() => {
    if (!open) return;
    const to = setTimeout(() => panelRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(to);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Measure panel width to sync the toggle button transform precisely
  useLayoutEffect(() => {
    const measure = () => {
      if (panelRef.current) {
        const w = panelRef.current.getBoundingClientRect().width;
        if (w && Math.abs(w - panelWidthPx) > 0.5) setPanelWidthPx(w);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [panelWidthPx]);

  // panel width matches Tailwind w-80 => 20rem; use CSS right transition instead of transform
  const panelWidthRem = "20rem";

  const router = useRouter();

  const toggleSelect = (id?: string | number) => {
    if (id === undefined || id === null) return;
    const sid = String(id);
    setSelectedIds((prev) => {
      const exists = prev.includes(sid);
      if (exists) return prev.filter((p) => p !== sid);
      if (prev.length >= 3) {
        // simple feedback — keep UX lightweight here
        window.alert("You can select up to 3 characters");
        return prev;
      }
      return [...prev, sid];
    });
  };

  const goGenerateVideo = () => {
    if (selectedIds.length === 0) {
      window.alert("Select at least one character to generate a video.");
      return;
    }
    const q = new URLSearchParams();
    q.set("ids", selectedIds.join(","));
    router.push(`/generate-video?${q.toString()}`);
  };

  return (
    <div>
      {/* Vertical button absolute top-right; moves exactly panel width when open */}
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-controls="character-viewer-panel"
        className="fixed right-0 top-0 z-50 bg-card rounded-l-md px-3 py-2 text-black shadow select-none"
        style={{
          // vertical label without rotation to avoid offscreen placement
          writingMode: "vertical-rl",
          // position the button flush to the left edge of the open panel (no gap)
          right: open ? `${panelWidthPx}px` : 0,
          transition: "right 300ms ease",
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        {/* Reserve space using the longest label so the button size doesn't jump */}
        <span className="invisible select-none">Character viewer</span>
        {/* Overlay labels that fade between states */}
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
          Character viewer
        </span>
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            Close
            <FiChevronRight aria-hidden="true" size={14} />
          </span>
        </span>
      </button>

      {/* Slide-out panel (from the right), absolute to avoid fixed positioning */}
      <div
        id="character-viewer-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-title"
        tabIndex={-1}
        className={`fixed right-0 top-0 z-40 h-screen w-96 transform bg-card shadow-lg outline-none transition-transform duration-300 overflow-y-auto overscroll-contain`}
        style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="p-4">
          <div className="mb-4 flex items-center">
            <h3 id="cv-title" className="text-lg font-semibold">Saved characters</h3>
          </div>

          {loading && <p className="text-sm text-zinc-600">Loading...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-4">
            {characters.map((c) => {
              const cid = String(c.id ?? c.name ?? "");
              const isSelected = selectedIds.includes(cid);
              return (
                <div
                  key={cid}
                  onClick={() => toggleSelect(c.id)}
                  role="button"
                  aria-pressed={isSelected}
                  tabIndex={0}
                  className={`group relative overflow-hidden rounded-lg border bg-background shadow-md transform-gpu scale-[1.02] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:shadow-xl ${
                    isSelected ? "ring-4 ring-accent/60" : ""
                  }`}
                  style={{ borderColor: "var(--border)", cursor: "pointer" }}
                >
                {/* Inner ring overlay for subtle separation */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[color:var(--border)] transition-all group-hover:ring-2"
                />
                {/* Image on top, fills the card width */}
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.name || "character"}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}
                </div>

                {/* Floating actions (Edit / Delete) in the bottom-right over the card */}
                <div className="absolute right-2 bottom-2 z-10 flex flex-col items-end gap-2">
                  <button
                    type="button"
                    style={{ background: "var(--accent)" }}
                    aria-label="Edit character"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Edit character", c.id);
                    }}
                    className="group/edit inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/90 text-black shadow backdrop-blur-sm transition-all duration-300 ease-out hover:w-auto hover:px-3 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                  >
                    <FiEdit size={18} />
                    <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-xs opacity-0 transition-all duration-300 group-hover/edit:ml-2 group-hover/edit:max-w-[64px] group-hover/edit:opacity-100">
                      Edit
                    </span>
                  </button>
                  <ExpandableCircleButton
                    variant="danger"
                    ariaLabel="Delete character"
                    label="Delete"
                    icon={<FiTrash2 size={18} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Delete character", c.id);
                    }}
                  />
                </div>
                {/* Text content at the bottom (extra bottom padding so it doesn't hide behind floating buttons) */}
                <div className="p-3 pb-12">
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground break-words">{c.description}</div>
                </div>
                {/* selection badge */}
                {isSelected && (
                  <div className="absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-medium">
                    ✓
                  </div>
                )}
              </div>
            );
            })}
          </div>
          {/* Footer with generate button */}
          <div className="sticky bottom-0 z-30 bg-card/80 backdrop-blur p-3">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={goGenerateVideo}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white shadow"
              >
                Generate video...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
