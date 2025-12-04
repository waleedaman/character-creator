export type Character = {
  id?: string | number;
  name?: string;
  description?: string;
  image?: string | null; // URL or data URL
};

export type ScriptChunk = {
  time: string;
  audio?: string;
  visuals?: string;
  characters?: Array<{ name: string; description?: string; image?: string }>;
};
