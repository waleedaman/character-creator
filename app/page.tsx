"use client";

import CharacterForm from "./components/CharacterForm";
import CharacterViewer from "./components/CharacterViewer";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="w-full max-w-3xl px-6 py-16">
        <CharacterForm />
      </main>
      <CharacterViewer />
    </div>
  );
}
