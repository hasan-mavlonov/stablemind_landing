// api.js -- thin fetch wrappers around the cockpit's JSON endpoints.
// Every endpoint is backed by the real Python engine via the Django demo views
// (core/mindform_demo.py -> core/mindform_engine/bridge.py).
//
// The API base path is injected by the page (window.MINDFORM_API_BASE) so the
// cockpit can be mounted under a URL prefix (e.g. "/demo/api") inside the site.

const API = (() => {
  const BASE = (window.MINDFORM_API_BASE || "/api").replace(/\/+$/, "");

  // Statuses from the host's proxy or Cloudflare (their pages are HTML, not our JSON)
  // meaning the request never got a proper answer from the demo: 502/503/504 and
  // Cloudflare's 520-524 origin errors.
  const GATEWAY_STATUSES = new Set([502, 503, 504, 520, 521, 522, 523, 524]);
  const TIMEOUT_STATUSES = new Set([504, 524]);
  // One such failure is usually a blip (a deploy switching over, a restart), so the
  // console stays usable and says "try again". Only this many in a row, or the demo's own
  // kill switch, swap it for the "Demo temporarily offline" card.
  const FAILURES_BEFORE_OFFLINE = 2;
  const RETRY_DELAY_MS = 1500;

  let failuresInARow = 0;

  // Swap the console for the "Demo temporarily offline" card (markup in the page): the
  // console behind it goes inert (no focus, hidden from screen readers) and focus moves to
  // the card's first action.
  function showOffline() {
    const el = document.getElementById("demo-offline");
    if (!el || !el.classList.contains("hidden")) return;
    el.classList.remove("hidden");
    for (const node of Array.from(document.body.children)) {
      if (node !== el && node.tagName !== "SCRIPT") node.inert = true;
    }
    const first = el.querySelector("a, button");
    if (first) first.focus();
  }

  function unreachable(message) {
    failuresInARow += 1;
    if (failuresInARow >= FAILURES_BEFORE_OFFLINE) showOffline();
    return new Error(message);
  }

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // One attempt. Resolves to the JSON body; rejects with an Error whose message the console
  // shows, and with .retryable set when the request never got a proper answer.
  async function attempt(path, opts) {
    let res;
    try {
      res = await fetch(path, opts);
    } catch (e) {                           // no response at all: network or server down
      const err = new Error("Can't reach the demo right now. Check your connection and try again.");
      err.retryable = true;
      throw err;
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON, e.g. a proxy's error page */ }
    if (data && data.offline) {             // the demo's kill switch (DEMO_ENABLED=false)
      showOffline();
      throw new Error(data.error || "The demo is temporarily offline.");
    }
    if (!res.ok) {
      if (GATEWAY_STATUSES.has(res.status) && !(data && data.error)) {
        const err = new Error(TIMEOUT_STATUSES.has(res.status)
          ? "The demo took too long to answer. Please try again."
          : "The demo is restarting or busy. Please try again in a moment.");
        err.retryable = true;
        throw err;
      }
      throw new Error((data && data.error) || `Request failed (${res.status}). Please try again.`);
    }
    return data;
  }

  // ``safe`` requests (reads, and opening a character) are retried once after a pause.
  // A chat turn or a new character is not: if the first try did reach the engine, a second
  // would apply the experience twice or create a duplicate.
  async function req(path, opts, { safe = true } = {}) {
    try {
      const data = await attempt(path, opts).catch(async (err) => {
        if (!(safe && err.retryable)) throw err;
        await wait(RETRY_DELAY_MS);
        return attempt(path, opts);
      });
      failuresInARow = 0;
      return data;
    } catch (err) {
      if (err.retryable) throw unreachable(err.message);
      failuresInARow = 0;                   // the server answered, so the demo is up
      throw err;
    }
  }

  function post(path, body, options) {
    return req(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }, options);
  }

  return {
    config: () => req(BASE + "/config"),
    characters: () => req(BASE + "/characters"),
    select: (name) => post(BASE + "/select", { name }),
    state: (name) => req(BASE + "/state?name=" + encodeURIComponent(name)),
    turn: (name, message) => post(BASE + "/turn", { name, message }, { safe: false }),
    createGenesis: (bio) => post(BASE + "/create/genesis", { bio }, { safe: false }),
    createManual: (identity, levels) => post(BASE + "/create/manual", { identity, levels }, { safe: false }),
  };
})();
