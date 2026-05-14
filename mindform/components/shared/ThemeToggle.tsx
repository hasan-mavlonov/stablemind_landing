"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeProviderScript() {
  // Inline script set before hydration to avoid theme flash.
  const code = `(() => {
    try {
      const stored = localStorage.getItem('mindform-theme');
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored || (prefers ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mindform-theme", next);
    } catch {}
    setTheme(next);
  };

  const label = mounted ? (theme === "light" ? "Dark" : "Light") : "Theme";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${label.toLowerCase()} theme`}
      className={`inline-flex items-center gap-2 border border-charcoal/30 px-3 py-1.5 text-sm hover:border-tomato hover:text-tomato transition-colors ${className}`}
      style={{ borderRadius: 2 }}
    >
      <span aria-hidden="true" className="inline-block w-3 h-3 border border-current">
        <span
          aria-hidden="true"
          className="block w-full h-full"
          style={{ background: mounted && theme === "dark" ? "currentColor" : "transparent" }}
        />
      </span>
      <span>{label}</span>
    </button>
  );
}
