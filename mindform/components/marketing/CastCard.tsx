"use client";

import { useState, useId } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CastMember } from "@/lib/cast";
import { CastIllustration } from "@/components/cast";

type Props = {
  member: CastMember;
  className?: string;
};

export default function CastCard({ member, className = "" }: Props) {
  const [flipped, setFlipped] = useState(false);
  const Illustration = CastIllustration[member.id];
  const id = useId();

  const toggle = () => setFlipped((v) => !v);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ perspective: 1200, width: 320, height: 460 }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 border-2 border-charcoal bg-bone p-6 flex flex-col gap-4"
          style={{ backfaceVisibility: "hidden", borderRadius: 2 }}
        >
          <button
            type="button"
            onClick={toggle}
            onKeyDown={onKey}
            aria-expanded={flipped}
            aria-controls={`${id}-back`}
            aria-label={`Flip ${member.name} card to see behavior parameters`}
            className="absolute inset-0 w-full h-full focus-visible:outline-2 focus-visible:outline-tomato"
            style={{ background: "transparent" }}
          />
          <div className="flex justify-center">
            <div className="wobble-target">
              {Illustration ? <Illustration className="w-[180px] h-[216px]" /> : null}
            </div>
          </div>
          <div>
            <div className="font-display font-semibold tracking-tight" style={{ fontSize: 32 }}>
              {member.name}
            </div>
            <div className="italic text-sm opacity-70 mt-1">{member.role}</div>
          </div>
          <div className="font-hand text-tomato leading-tight" style={{ fontSize: 24 }}>
            “{member.quote}”
          </div>
          <div className="mt-auto text-xs uppercase tracking-widest opacity-50">
            Tap to flip
          </div>
        </div>

        {/* Back */}
        <div
          id={`${id}-back`}
          className="absolute inset-0 system-surface border-2 border-tomato p-5 flex flex-col gap-3 overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 2,
          }}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={`Flip ${member.name} card back`}
            className="absolute top-3 right-3 z-10 border border-tomato px-2 py-0.5 text-[10px] hover:bg-tomato hover:text-offblack"
            style={{ borderRadius: 2 }}
          >
            close
          </button>
          <div className="text-tomato text-xs uppercase tracking-widest">
            {member.name} / spec
          </div>
          <table className="text-[11px] w-full border-collapse">
            <tbody>
              {Object.entries(member.params).map(([k, v]) => (
                <tr key={k} className="border-b border-offwhite/10">
                  <td className="py-1 pr-2 text-offwhite/50">{k}</td>
                  <td className="py-1 text-offwhite text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-1">
            <div className="text-[10px] text-offwhite/40 uppercase tracking-widest mb-1">
              voice sample
            </div>
            <audio controls className="w-full h-7 opacity-80" aria-label={`${member.name} voice sample`}>
              <source />
            </audio>
          </div>

          <div>
            <div className="text-[10px] text-offwhite/40 uppercase tracking-widest mb-1">used for</div>
            <div className="text-xs text-offwhite">{member.uses.join(", ")}.</div>
          </div>

          <Link
            href={`/cast#${member.id}`}
            className="mt-auto text-tomato text-sm hover:underline relative z-10"
          >
            Use this personality →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
