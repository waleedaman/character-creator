"use client";

import React from "react";
import type { Character } from "../lib/types";

export default function SelectedCharacters({ characters }: { characters: Character[] }) {
  return (
    <div className="py-2">
      <div className="flex gap-3 overflow-x-auto px-1 py-1 items-stretch">
        {characters.map((c) => {
          const cid = String(c.id ?? c.name ?? "");
          return (
            <div
              key={cid}
              className="group relative w-56 flex-shrink-0 max-w-[14rem] overflow-hidden rounded-lg border bg-background shadow-md transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative h-28 w-full overflow-hidden bg-muted">
                {c.image ? (
                  <img src={c.image} alt={c.name ?? "char"} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="mt-1 text-xs text-muted-foreground whitespace-normal break-words">{c.description}</div>
              </div>
              <div className="absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-medium">
                ✓
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
