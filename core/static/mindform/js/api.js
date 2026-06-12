// api.js -- thin fetch wrappers around the cockpit's JSON endpoints.
// Every endpoint is backed by the real Python engine via the Django demo views
// (core/mindform_demo.py -> core/mindform_engine/bridge.py).
//
// The API base path is injected by the page (window.MINDFORM_API_BASE) so the
// cockpit can be mounted under a URL prefix (e.g. "/demo/api") inside the site.

const API = (() => {
  const BASE = (window.MINDFORM_API_BASE || "/api").replace(/\/+$/, "");

  async function req(path, opts) {
    const res = await fetch(path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
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
