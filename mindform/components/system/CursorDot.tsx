"use client";

import { useEffect, useRef } from "react";

export default function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let mx = -50;
    let my = -50;

    const move = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      el.classList.add("is-visible");
    };
    const leave = () => el.classList.remove("is-visible");

    const tick = () => {
      tx += (mx - tx) * 0.25;
      ty += (my - ty) * 0.25;
      el.style.transform = `translate3d(${tx - 8}px, ${ty - 8}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div ref={ref} className="cursor-dot" aria-hidden="true" />;
}
