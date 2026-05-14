import Link from "next/link";
import { Ada, Vex, Mox, Hale, June, Orin } from "@/components/cast";

const offsets = [
  { top: 0, left: 0, delay: 0 },
  { top: 36, left: 200, delay: 1.2 },
  { top: 12, left: 380, delay: 0.6 },
  { top: 220, left: 60, delay: 1.8 },
  { top: 196, left: 240, delay: 0.3 },
  { top: 240, left: 410, delay: 1.5 },
];

export default function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1280px] px-6 pt-12 pb-24 md:pt-20 md:pb-32 grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-96px)]">
        {/* left: headline */}
        <div>
          <h1
            className="font-display font-semibold tracking-tight leading-[0.96]"
            style={{ fontSize: "clamp(56px, 9vw, 96px)" }}
          >
            AI that feels
            <br />
            like someone.
          </h1>
          <p className="mt-8 max-w-[480px] text-[18px] md:text-[20px] leading-[1.55] opacity-90">
            Drop a personality into anything. Robots. NPCs. Companions.
            Influencers. Built once, lives anywhere.
          </p>
          <div className="mt-10 flex flex-wrap gap-8 text-tomato text-[17px]">
            <Link
              href="/cast"
              className="border-b border-transparent hover:border-tomato pb-0.5 focus-visible:outline-none focus-visible:border-tomato"
            >
              See the cast →
            </Link>
            <Link
              href="/docs"
              className="border-b border-transparent hover:border-tomato pb-0.5 focus-visible:outline-none focus-visible:border-tomato"
            >
              Read the docs →
            </Link>
          </div>
        </div>

        {/* right: floating cast grid */}
        <div
          aria-hidden="false"
          className="relative h-[520px] hidden md:block"
          role="group"
          aria-label="Six personalities, floating"
        >
          <CastSlot illustration={<Ada className="w-[160px] h-[200px]" />} {...offsets[0]} label="Ada" />
          <CastSlot illustration={<Vex className="w-[160px] h-[200px]" />} {...offsets[1]} label="Vex" />
          <CastSlot illustration={<Mox className="w-[160px] h-[200px]" />} {...offsets[2]} label="Mox" />
          <CastSlot illustration={<Hale className="w-[160px] h-[200px]" />} {...offsets[3]} label="Hale" />
          <CastSlot illustration={<June className="w-[160px] h-[200px]" />} {...offsets[4]} label="June" />
          <CastSlot illustration={<Orin className="w-[160px] h-[200px]" />} {...offsets[5]} label="Orin" />
        </div>

        {/* mobile: simple horizontal scroll teaser */}
        <div className="md:hidden flex gap-4 overflow-x-auto -mx-6 px-6 pb-4">
          <Ada className="w-[140px] h-[170px] shrink-0" />
          <Vex className="w-[140px] h-[170px] shrink-0" />
          <Mox className="w-[140px] h-[170px] shrink-0" />
          <Hale className="w-[140px] h-[170px] shrink-0" />
          <June className="w-[140px] h-[170px] shrink-0" />
          <Orin className="w-[140px] h-[170px] shrink-0" />
        </div>
      </div>
    </section>
  );
}

function CastSlot({
  illustration,
  top,
  left,
  delay,
  label,
}: {
  illustration: React.ReactNode;
  top: number;
  left: number;
  delay: number;
  label: string;
}) {
  return (
    <div
      className="absolute float-anim wobble-target"
      style={{ top, left, animationDelay: `${delay}s` }}
      tabIndex={0}
      aria-label={label}
    >
      {illustration}
    </div>
  );
}
