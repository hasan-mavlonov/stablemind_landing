"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!email.includes("@")) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="system-surface border-t border-tomato">
      <div className="mx-auto max-w-[1280px] px-6 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <div className="text-lg font-bold tracking-tight">MINDFORM</div>
          <p className="mt-3 text-xs text-offwhite/60 leading-relaxed">
            The personality layer for AI. Ship voices, not just models.
          </p>
        </div>

        <div>
          <div className="text-xs text-offwhite/40 uppercase tracking-widest mb-3">Product</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cast" className="hover:text-tomato">Cast</Link></li>
            <li><Link href="/pricing" className="hover:text-tomato">Pricing</Link></li>
            <li><Link href="/cast" className="hover:text-tomato">Voice library</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs text-offwhite/40 uppercase tracking-widest mb-3">Developers</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/docs" className="hover:text-tomato">Docs</Link></li>
            <li><Link href="/docs" className="hover:text-tomato">API reference</Link></li>
            <li><Link href="/docs" className="hover:text-tomato">SDKs</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs text-offwhite/40 uppercase tracking-widest mb-3">Company</div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-tomato">About</Link></li>
            <li><Link href="/" className="hover:text-tomato">Careers</Link></li>
            <li><Link href="/" className="hover:text-tomato">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 pb-12">
        <div className="border border-tomato p-4 max-w-md">
          <div className="text-xs uppercase tracking-widest text-tomato mb-2">
            Get the personality digest
          </div>
          <p className="text-xs text-offwhite/60 mb-3">
            One short letter a month. New voices, behavior notes, the occasional postmortem.
          </p>
          {submitted ? (
            <div className="text-xs text-tomato">Filed. Check your inbox.</div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                aria-label="Email address"
                className="flex-1 bg-transparent border border-offwhite/30 px-2 py-1.5 text-xs focus:outline-none focus:border-tomato"
                style={{ borderRadius: 2 }}
              />
              <button
                type="button"
                onClick={submit}
                className="border border-tomato bg-tomato text-offblack px-3 py-1.5 text-xs hover:bg-transparent hover:text-tomato transition-colors"
                style={{ borderRadius: 2 }}
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 py-6 border-t border-tomato/30 flex justify-between text-[12px] text-offwhite/40">
        <div>© {new Date().getFullYear()} Mindform Labs</div>
        <div>mindform-ai.com</div>
      </div>
    </footer>
  );
}
