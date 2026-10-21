// api.js -- thin fetch wrappers around the cockpit's JSON endpoints.
// Every endpoint is backed by the real Python engine via the Django demo views
// (core/mindform_demo.py -> core/mindform_engine/bridge.py).
//
// The API base path is injected by the page (window.MINDFORM_API_BASE) so the
// cockpit can be mounted under a URL prefix (e.g. "/demo/api") inside the site.

const API = (() => {
  const BASE = (window.MINDFORM_API_BASE || "/api").replace(/\/+$/, "");

  // Statuses meaning the demo itself is down or overloaded, not that one request was
  // bad: 503 from the DEMO_ENABLED kill switch, 502/504 from the host's proxy, and
  // Cloudflare's 520-524 origin errors (its own pages are HTML, not our JSON).
  const OFFLINE_STATUSES = new Set([502, 503, 504, 520, 521, 522, 523, 524]);

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

  async function req(path, opts) {
    let res;
    try {
      res = await fetch(path, opts);
    } catch (e) {                           // no response at all: server or network down
      showOffline();
      throw new Error("the demo is offline");
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      if (OFFLINE_STATUSES.has(res.status) || (data && data.offline)) showOffline();
      const msg = (data && data.error) || `request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  function post(path, body) {
    return req(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
  }

  return {
    config: () => req(BASE + "/config"),
    characters: () => req(BASE + "/characters"),
    select: (name) => post(BASE + "/select", { name }),
    state: (name) => req(BASE + "/state?name=" + encodeURIComponent(name)),
    turn: (name, message) => post(BASE + "/turn", { name, message }),
    createGenesis: (bio) => post(BASE + "/create/genesis", { bio }),
    createManual: (identity, levels) => post(BASE + "/create/manual", { identity, levels }),
  };
})();
