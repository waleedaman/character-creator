"use client";

import React, { useState } from "react";
import ImageDropzone from "./ImageDropzone";
import ImagePreview from "./ImagePreview";
import PrimaryButton from "./PrimaryButton";
import AccentButton from "./AccentButton";

export default function CharacterForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [genDescError, setGenDescError] = useState<string | null>(null);
  const [descModePrompt, setDescModePrompt] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imgPromptVisible, setImgPromptVisible] = useState(false);
  const [tempPrompt, setTempPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [genImageError, setGenImageError] = useState<string | null>(null);

  // Normalize various backend image responses into a valid data URL.
  // Accepts:
  // - a raw base64 string (iVBOR...)
  // - a data URL (data:image/png;base64,...)
  // - accidentally duplicated prefixes like "data:image/png;base64,data:image/png;base64,iVBOR..."
  const normalizeImageResponse = (raw: any): string | null => {
    if (!raw) return null;
    if (typeof raw !== "string") return null;

    let s = raw.trim();

    // If it's already a data URL, try to clean duplicates and return
    if (s.startsWith("data:")) {
      // remove duplicated occurrences: keep everything after the last 'base64,'
      const lastBase64Index = s.lastIndexOf("base64,");
      if (lastBase64Index !== -1) {
        const after = s.substring(lastBase64Index + "base64,".length);
        return `data:image/png;base64,${after}`;
      }
      return s;
    }

    // If the string contains 'base64,' somewhere (but doesn't start with data:),
    // assume it's like '...base64,iVBOR...' and take the part after the last base64, marker.
    if (s.includes("base64,")) {
      const after = s.substring(s.lastIndexOf("base64,") + "base64,".length);
      return `data:image/png;base64,${after}`;
    }

    // Otherwise assume it's raw base64 and prefix it.
    return `data:image/png;base64,${s}`;
  };

  const onFileSelected = (file: File | null) => {
    setImageFile(file);
    if (!file) {
      setImagePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
  };

  const toggleDescMode = () => {
    setDescModePrompt((s) => !s);
  };

  // Normalize description format to avoid markdown artifacts like "* **Age:** 12"
  const normalizeDescriptionFormat = (raw: string): string => {
    if (!raw) return raw;
    let s = String(raw);
    // Normalize line endings
    s = s.replace(/\r\n/g, "\n");
    // Remove list bullets at line starts
    s = s.replace(/^\s*[-*]\s+/gm, "");
    // Remove bold/italic markers
    s = s.replace(/\*\*|__/g, "");
    s = s.replace(/(^|\s)[*_]([\w\s]+)[*_](?=\s|$)/g, "$1$2");
    // Trim whitespace around labels and keep "Label: value" form
    s = s.replace(/^\s*([A-Za-z][A-Za-z\s]+?)\s*:\s*/gm, (m, p1) => `${p1.trim()}: `);
    return s.trim();
  };

  const handleGenerateDescription = () => {
    // POST prompt to backend and use returned description
    if (!tempPrompt.trim()) return;

    setIsGeneratingDesc(true);
    setGenDescError(null);

    // Compose an instruction to request a plain, line-based schema with exact keys
    const structuredInstruction =
      "Return ONLY plain text in this exact multi-line schema (one key per line, in this order), with no bullets and no Markdown:" +
      "\nStyle: <art direction; e.g., Animated colorful, painterly, semi-realistic>" +
      "\nAge: <number> years old" +
      "\nGender: <Male | Female | Nonbinary | Other>" +
      "\nBuild: <body type details; e.g., lean, wiry; include agility/stamina cues if relevant>" +
      "\nHair: <length, style, and color; e.g., short, tousled, sun-bleached brown>" +
      "\nEyes: <color and quality; e.g., bright hazel, intelligent>" +
      "\nSkin: <tone and characteristics; e.g., tanned with light freckles>" +
      "\nClothing: <top, outerwear, bottoms, footwear; materials, colors, wear; e.g., khaki cargo vest with pockets over light blue worn long-sleeved shirt; dark brown cargo shorts; brown hiking boots>" +
      "\nAccessories: <comma-separated gear; e.g., worn leather explorer hat tilted back; small compass on leather cord>" +
      "\nExpression: <facial mood; e.g., eager, determined with exuberance>" +
      "\nPose: <succinct pose; e.g., mid-stride, leaning, hands-on-hips>" +
      "\nAdditional details: <optional concise details that enrich the character only; avoid background scene>" +
      "\n\nStrict formatting rules:" +
      "\n- Use exactly these keys and order." +
      "\n- Use the pattern 'Key: value' on each line." +
      "\n- No headings, no bullets, no Markdown, no asterisks, no bold." +
      "\n- Be vivid and specific (materials, textures, colors), but keep each value to a single line.";

    const composedPrompt = `${structuredInstruction}\n\nUser prompt: ${tempPrompt}`;

    fetch("/api/generate-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // send under both keys to be compatible with varying backends
      body: JSON.stringify({ prompt: composedPrompt, tempPrompt: composedPrompt }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        // expect { description: string }
        if (data && typeof data.description === "string") {
          setDescription(normalizeDescriptionFormat(data.description));
        } else {
          throw new Error("Invalid response from generate-description");
        }
        setTempPrompt("");
        setDescModePrompt(false);
      })
      .catch((err: any) => {
        setGenDescError(err?.message || String(err));
      })
      .finally(() => setIsGeneratingDesc(false));
  };

  const handleAnalyzeImage = () => {
    if (!imageFile) return;
    // placeholder: analyze uploaded image and fill description
    setDescription((d) => (d ? d + " (analyzed)" : "Description from image (analyzed)"));
  };

  const handleGenerateImageFromPrompt = () => {
    // send prompt to backend to generate base64 image
    if (!tempPrompt.trim()) {
      setGenImageError("Please enter an image prompt.");
      return;
    }

    setIsGeneratingImage(true);
    setGenImageError(null);

  fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: tempPrompt }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: any) => {
        // expect { image: "<base64>" }
        const b64 = data?.image || data?.base64 || data?.data;
        if (typeof b64 === "string" && b64.length > 0) {
          const normalized = normalizeImageResponse(b64);
          if (normalized) setImagePreviewUrl(normalized);
          setTempPrompt("");
          setImgPromptVisible(false);
        } else {
          throw new Error("Invalid response from generate-image");
        }
      })
      .catch((err: any) => {
        setGenImageError(err?.message || String(err));
      })
      .finally(() => setIsGeneratingImage(false));
  };

  const handleGenerateImageFromDescription = () => {
    if (!description.trim()) {
      setGenImageError("Description is empty — enter a description or generate one first.");
      return;
    }

    // Build the prompt by prepending the required instruction
    const instruction =
      "Generate a character image in png format in 4k resolution with transparent background based on the following character description";
    const prompt = `${instruction} ${description}`;

    setIsGeneratingImage(true);
    setGenImageError(null);

  fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: any) => {
        const b64 = data?.image || data?.base64 || data?.data;
        if (typeof b64 === "string" && b64.length > 0) {
          const normalized = normalizeImageResponse(b64);
          if (normalized) setImagePreviewUrl(normalized);
        } else {
          throw new Error("Invalid response from generate-image");
        }
      })
      .catch((err: any) => {
        setGenImageError(err?.message || String(err));
      })
      .finally(() => setIsGeneratingImage(false));
  };

  const handleSaveCharacter = () => {
    saveToBackend();
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveToBackend = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // If a File was selected, send multipart/form-data
      if (imageFile) {
        const form = new FormData();
        form.append("name", name);
        form.append("description", description);
        form.append("image", imageFile, imageFile.name);

        const res = await fetch("/api/characters", {
          method: "POST",
          body: form,
        });

        if (!res.ok) throw new Error(await res.text());
      } else if (imagePreviewUrl) {
        // If there's a preview data URL, strip the prefix and send JSON with base64
        const base64 = imagePreviewUrl.replace(/^data:image\/png;base64,/, "");
        const res = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, image: base64 }),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        // No image provided — still allow saving name/description
        const res = await fetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      // success
      // eslint-disable-next-line no-console
      console.log("Saved character", { name, description });
      // Notify other components (e.g., CharacterViewer) to refresh immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("characters:changed", { detail: { action: "created" } }));
      }
      alert("Character saved");
    } catch (err: any) {
      setSaveError(err?.message || String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      className="w-full max-w-3xl space-y-6 rounded-md bg-card p-8 shadow-sm border"
      style={{ borderColor: "var(--border)" }}
    >
      <h2 className="text-2xl font-semibold">AI Character Creator</h2>

      <div>
        <label className="mb-2 block text-sm font-medium">Character Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Enter character name"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Character Description</label>
        {!descModePrompt ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Enter character description"
            rows={4}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <input
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter character prompt"
            />
            <div className="flex gap-2">
              <AccentButton onClick={handleGenerateDescription} disabled={isGeneratingDesc}>
                {isGeneratingDesc ? "Generating..." : "Generate description"}
              </AccentButton>
              <AccentButton onClick={() => setDescModePrompt(false)}>Cancel</AccentButton>
            </div>
            {genDescError && <p className="mt-2 text-sm text-red-600">{genDescError}</p>}
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <AccentButton onClick={toggleDescMode}>Generate from prompt</AccentButton>
          <AccentButton onClick={handleAnalyzeImage}>Analyze uploaded image</AccentButton>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Character Image</label>
        <ImageDropzone onFileSelected={onFileSelected} />

        <div className="mt-2 flex gap-2">
          <AccentButton onClick={() => setImgPromptVisible((v) => !v)}>
            Generate image from prompt
          </AccentButton>
          <AccentButton onClick={handleGenerateImageFromDescription}>
            Generate image from description
          </AccentButton>
        </div>

        {isGeneratingImage && <p className="mt-2 text-sm text-zinc-600">Generating image...</p>}
        {genImageError && <p className="mt-2 text-sm text-red-600">{genImageError}</p>}

        {imgPromptVisible && (
          <div className="mt-2 flex gap-2">
            <input
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter image prompt"
            />
            <AccentButton onClick={handleGenerateImageFromPrompt}>
              Generate image
            </AccentButton>
          </div>
        )}

        <ImagePreview src={imagePreviewUrl} />
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <PrimaryButton onClick={handleSaveCharacter} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save character"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
