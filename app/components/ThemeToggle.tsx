"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize from localStorage or system preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = (saved as "light" | "dark") || (prefersDark ? "dark" : "light");
      apply(next);
    } catch {
      apply("light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apply = (t: "light" | "dark") => {
    setTheme(t);
    const root = document.documentElement;
    root.classList.toggle("dark", t === "dark");
    try {
      localStorage.setItem("theme", t);
    } catch {}
  };

  const toggle = () => apply(theme === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="absolute left-2 top-2 z-50 inline-flex items-center gap-2 rounded-md border px-3 py-2 shadow-sm"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--border)",
      }}
    >
      {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
      <span className="text-sm">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
