import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export const metadata = {
  title: "Pricing. Mindform.",
};

const tiers = [
  {
    name: "Hobby",
    price: "$0",
    blurb: "For weekend projects and trying the cast.",
    rows: [
      ["personalities", "1"],
      ["messages", "1,000 / mo"],
      ["voice samples", "preview only"],
      ["thread memory", "24 hours"],
      ["support", "community"],
      ["sla", "best effort"],
    ],
  },
  {
    name: "Studio",
    price: "$99 / mo",
    blurb: "For teams shipping a product with a roster.",
    rows: [
      ["personalities", "all 6"],
      ["messages", "100,000 / mo"],
      ["voice samples", "full library"],
      ["thread memory", "30 days"],
      ["support", "email, 48h"],
      ["sla", "99.5%"],
    ],
  },
  {
    name: "Foundry",
    price: "custom",
    blurb: "For studios authoring their own voices at scale.",
    rows: [
      ["personalities", "your own + ours"],
      ["messages", "negotiated"],
      ["fine-tuning", "included"],
      ["thread memory", "configurable"],
      ["support", "shared slack"],
      ["sla", "99.9%, on-prem option"],
    ],
  },
];

export default function PricingPage() {
  return (
    <main>
      <Header />
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-6">
          <h1
            className="font-display font-semibold tracking-tight leading-[0.96]"
            style={{ fontSize: "clamp(48px, 8vw, 96px)" }}
          >
            Pricing.
          </h1>
          <p className="mt-6 text-[18px] md:text-[20px] leading-[1.55] opacity-90 max-w-2xl">
            Three tiers. No seat counting. Switch any time, no contracts on
            Hobby or Studio.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {tiers.map((t, i) => (
              <div
                key={t.name}
                className="font-mono border-2 border-charcoal p-6 bg-bone flex flex-col"
                style={{ borderRadius: 2 }}
              >
                <div className="text-[11px] uppercase tracking-widest opacity-60">
                  tier_{String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-display font-semibold text-[28px] mt-2 mb-1">
                  {t.name}
                </div>
                <div className="text-tomato text-[24px] font-bold">{t.price}</div>
                <p className="text-xs mt-3 leading-relaxed opacity-70 mb-6">
                  {t.blurb}
                </p>
                <table className="w-full text-[12px] border-collapse mb-6">
                  <tbody>
                    {t.rows.map(([k, v]) => (
                      <tr key={k} className="border-b border-charcoal/15">
                        <td className="py-1.5 pr-2 opacity-60">{k}</td>
                        <td className="py-1.5 text-right">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-auto">
                  <a
                    href="#"
                    className="block text-center border border-tomato text-tomato px-4 py-2 hover:bg-tomato hover:text-bone transition-colors text-xs uppercase tracking-widest"
                    style={{ borderRadius: 2 }}
                  >
                    Start {t.name.toLowerCase()}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
