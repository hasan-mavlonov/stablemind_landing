import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CastCard from "@/components/marketing/CastCard";
import { cast } from "@/lib/cast";

export const metadata = {
  title: "The cast. Mindform.",
  description:
    "Six personalities, six voices. Ada, Vex, Mox, Hale, June, Orin. Each ships with system prompt, memory schema, voice model, and behavioral parameters.",
};

export default function CastPage() {
  return (
    <main>
      <Header />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="max-w-3xl">
            <h1
              className="font-display font-semibold tracking-tight leading-[0.96]"
              style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
            >
              The cast.
            </h1>
            <p className="mt-6 text-[18px] md:text-[20px] leading-[1.55] opacity-90 max-w-2xl">
              Six personalities, ready to drop in. Each one is a real bundle:
              system prompt, memory schema, voice model, behavior parameters.
              Click any card to see what is inside.
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:gap-12 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {cast.map((m) => (
              <div key={m.id} id={m.id} className="scroll-mt-24">
                <CastCard member={m} />
              </div>
            ))}
          </div>

          <div className="mt-24 border-t border-charcoal/15 pt-10 grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="font-display font-semibold text-[28px] md:text-[32px] leading-tight">
                Want one of your own?
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed opacity-85 max-w-md">
                The Foundry tier lets you author and version your own
                personalities, fine-tune voice models on your data, and pin
                behavior to a public spec your team can reason about.
              </p>
            </div>
            <ul className="text-sm space-y-2 font-mono">
              <li>· author personalities in YAML or our SDK</li>
              <li>· version and diff like code</li>
              <li>· pin behavior to test fixtures</li>
              <li>· deploy on Mindform cloud or on-prem</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
