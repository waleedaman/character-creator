"use client";

import React from "react";

type Props = {
  src?: string | null;
  alt?: string;
};

export default function ImagePreview({ src, alt = "Character image" }: Props) {
  return (
    <div className="mt-4">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="max-h-64 w-auto rounded-md shadow-sm" />
      ) : (
        <div className="flex h-64 w-full items-center justify-center rounded-md border border-dashed border-black/20">
          <p className="text-sm text-zinc-500">Image preview will appear here</p>
        </div>
      )}
    </div>
  );
}
