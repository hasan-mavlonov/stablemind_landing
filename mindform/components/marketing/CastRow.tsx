import { cast } from "@/lib/cast";
import CastCard from "./CastCard";

export default function CastRow() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <h2 className="font-display font-semibold tracking-tight text-[40px] md:text-[56px] leading-[1.05]">
            Meet the cast.
          </h2>
          <p className="text-sm opacity-70 max-w-sm">
            Six personalities, ready to drop in. Click any card to see its
            behavior parameters.
          </p>
        </div>
      </div>

      <div
        className="overflow-x-auto pb-6"
        role="region"
        aria-label="Cast carousel"
      >
        <div className="flex gap-6 px-6 md:px-[max(24px,calc((100vw-1280px)/2+24px))]">
          {cast.map((m) => (
            <div key={m.id} className="shrink-0">
              <CastCard member={m} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
