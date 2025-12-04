export async function toDataUrl(src?: string | null): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.startsWith("data:")) return src;
  try {
    const r = await fetch(src, { mode: "cors" });
    if (!r.ok) throw new Error(`${r.status}`);
    const blob = await r.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    return dataUrl;
  } catch {
    return src; // CORS fallback
  }
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
