"use client";

import React, { useCallback, useRef, useState } from "react";

type Props = {
  onFileSelected: (file: File | null) => void;
};

export default function ImageDropzone({ onFileSelected }: Props) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files && files[0] ? files[0] : null;
    onFileSelected(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setHover(false);
      handleFiles(e.dataTransfer.files);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        className={`flex h-40 w-full items-center justify-center rounded-md border-2 border-dashed p-4 text-center transition-colors ${
          hover ? "border-black/60 bg-black/5" : "border-black/20"
        }`}
        onClick={openFilePicker}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div>
          <p className="text-sm text-zinc-600">Drop an image here, or click to upload</p>
        </div>
      </div>
    </div>
  );
}
