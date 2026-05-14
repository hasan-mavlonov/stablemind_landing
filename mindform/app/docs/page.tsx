import Link from "next/link";
import CodeBlock from "@/components/system/CodeBlock";
import CursorDot from "@/components/system/CursorDot";
import ThemeToggle from "@/components/shared/ThemeToggle";

export const metadata = {
  title: "Docs. Mindform.",
  description: "Mindform API reference. Personalities, threads, voices.",
};

const endpoints = [
  ["GET", "/v1/personalities", "list all personalities, 6 prod + 47 beta"],
  ["GET", "/v1/personalities/:id", "retrieve a single personality spec"],
  ["POST", "/v1/threads", "create a new memory-bearing thread"],
  ["POST", "/v1/chat/completions", "send a message, optionally with personality"],
  ["POST", "/v1/voice/synthesize", "render text in the personality voice"],
  ["GET", "/v1/usage", "current period usage and limits"],
];

const params = [
  ["personality", "string", "id of any cast member or your own"],
  ["thread", "string", "thread id from POST /v1/threads"],
  ["input", "string", "user message"],
  ["memory.mode", "enum", "long, short, task-scoped, selective"],
  ["voice.render", "bool", "synthesize audio in addition to text"],
  ["stream", "bool", "stream tokens, OpenAI-compatible event shape"],
];

export default function DocsPage() {
  return (
    <main className="system-surface min-h-screen">
      <CursorDot />

      {/* Header */}
      <header className="border-b border-tomato">
        <div className="mx-auto max-w-[1280px] px-6 py-5 flex items-center justify-between font-mono">
          <Link href="/" className="text-offwhite hover:text-tomato text-sm">
            ← mindform / docs
          </Link>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/cast" className="hover:text-tomato">cast</Link>
            <Link href="/docs" className="text-tomato">docs</Link>
            <Link href="/pricing" className="hover:text-tomato">pricing</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-16 grid md:grid-cols-[200px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="font-mono text-[12px] space-y-6">
          <div>
            <div className="text-tomato uppercase tracking-widest mb-2">getting started</div>
            <ul className="space-y-1.5 text-offwhite/70">
              <li><a href="#install" className="hover:text-tomato">install</a></li>
              <li><a href="#auth" className="hover:text-tomato">authentication</a></li>
              <li><a href="#quickstart" className="hover:text-tomato">quickstart</a></li>
            </ul>
          </div>
          <div>
            <div className="text-tomato uppercase tracking-widest mb-2">reference</div>
            <ul className="space-y-1.5 text-offwhite/70">
              <li><a href="#endpoints" className="hover:text-tomato">endpoints</a></li>
              <li><a href="#parameters" className="hover:text-tomato">parameters</a></li>
              <li><a href="#errors" className="hover:text-tomato">errors</a></li>
            </ul>
          </div>
          <div>
            <div className="text-tomato uppercase tracking-widest mb-2">guides</div>
            <ul className="space-y-1.5 text-offwhite/70">
              <li><a href="#swap" className="hover:text-tomato">swap mid-thread</a></li>
              <li><a href="#voice" className="hover:text-tomato">voice rendering</a></li>
              <li><a href="#custom" className="hover:text-tomato">custom personalities</a></li>
            </ul>
          </div>
        </aside>

        {/* Main */}
        <article className="font-mono">
          <h1 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-2">
            Mindform API
          </h1>
          <p className="text-offwhite/60 text-sm max-w-2xl">
            One endpoint shape, many voices. The API mirrors
            /v1/chat/completions, so if your stack speaks OpenAI it already
            speaks Mindform.
          </p>

          <section id="install" className="mt-12">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-3">
              install
            </h2>
            <pre className="border border-tomato p-4 text-[13px] bg-offblack" style={{ borderRadius: 2 }}>
              <code>{`npm install mindform
# or
pip install mindform`}</code>
            </pre>
          </section>

          <section id="auth" className="mt-12">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-3">
              authentication
            </h2>
            <p className="text-sm text-offwhite/70 max-w-2xl mb-3">
              All requests carry a bearer token. Issue keys from the dashboard.
              Keys are scoped per project, rotate without downtime.
            </p>
            <pre className="border border-tomato p-4 text-[13px] bg-offblack" style={{ borderRadius: 2 }}>
              <code>Authorization: Bearer mf_live_********</code>
            </pre>
          </section>

          <section id="quickstart" className="mt-12">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-3">
              quickstart
            </h2>
            <CodeBlock />
          </section>

          <section id="endpoints" className="mt-16">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-4">
              endpoints
            </h2>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="text-left text-offwhite/40 text-[11px] uppercase tracking-widest">
                  <th className="py-2 pr-4 font-normal">method</th>
                  <th className="py-2 pr-4 font-normal">path</th>
                  <th className="py-2 font-normal">description</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map(([m, p, d]) => (
                  <tr key={p} className="border-t border-offwhite/10">
                    <td className="py-2 pr-4 text-tomato">{m}</td>
                    <td className="py-2 pr-4">{p}</td>
                    <td className="py-2 text-offwhite/70">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="parameters" className="mt-16">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-4">
              parameters
            </h2>
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="text-left text-offwhite/40 text-[11px] uppercase tracking-widest">
                  <th className="py-2 pr-4 font-normal">name</th>
                  <th className="py-2 pr-4 font-normal">type</th>
                  <th className="py-2 font-normal">description</th>
                </tr>
              </thead>
              <tbody>
                {params.map(([n, t, d]) => (
                  <tr key={n} className="border-t border-offwhite/10">
                    <td className="py-2 pr-4 text-tomato">{n}</td>
                    <td className="py-2 pr-4 text-offwhite/60">{t}</td>
                    <td className="py-2 text-offwhite/80">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="errors" className="mt-16">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-4">
              errors
            </h2>
            <p className="text-sm text-offwhite/70 max-w-2xl mb-4">
              Errors return JSON with a stable code, a human message, and a
              docs link. Codes are versioned, never reused.
            </p>
            <pre className="border border-tomato p-4 text-[13px] bg-offblack" style={{ borderRadius: 2 }}>
              <code>{`{
  "error": {
    "code": "personality_not_found",
    "message": "No personality with id \\"hale-2\\".",
    "docs": "https://mindform-ai.com/docs#errors"
  }
}`}</code>
            </pre>
          </section>

          <section id="swap" className="mt-16">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-3">
              swap mid-thread
            </h2>
            <p className="text-sm text-offwhite/70 max-w-2xl">
              Pass a new personality id on any send. Memory carries over. Voice
              changes. Behavior parameters reset to the new personality default
              unless overridden inline.
            </p>
          </section>

          <section id="voice" className="mt-12">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-3">
              voice rendering
            </h2>
            <p className="text-sm text-offwhite/70 max-w-2xl">
              Every personality ships with a voice model. Set voice.render: true
              and the response includes a signed audio URL alongside text.
            </p>
          </section>

          <section id="custom" className="mt-12 mb-24">
            <h2 className="text-[20px] font-bold text-tomato uppercase tracking-widest mb-3">
              custom personalities
            </h2>
            <p className="text-sm text-offwhite/70 max-w-2xl">
              Available on Foundry. Author in YAML, version with git, deploy
              with one command. Behavior pins to fixtures so changes never
              silently regress the voice.
            </p>
          </section>
        </article>
      </div>

      <footer className="border-t border-tomato">
        <div className="mx-auto max-w-[1280px] px-6 py-6 font-mono text-[11px] text-offwhite/40 flex justify-between">
          <span>mindform / docs / v1</span>
          <span>last updated 2026-05-01</span>
        </div>
      </footer>
    </main>
  );
}
