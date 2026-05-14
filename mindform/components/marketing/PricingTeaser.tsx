import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  rows: [string, string][];
};

const tiers: Tier[] = [
  {
    name: "Hobby",
    price: "$0",
    rows: [
      ["personalities", "1"],
      ["messages", "1k / mo"],
      ["voice samples", "preview only"],
      ["support", "community"],
    ],
  },
  {
    name: "Studio",
    price: "$99 / mo",
    rows: [
      ["personalities", "6"],
      ["messages", "100k / mo"],
      ["voice samples", "full library"],
      ["support", "email, 48h"],
    ],
  },
  {
    name: "Foundry",
    price: "custom",
    rows: [
      ["personalities", "your own"],
      ["messages", "negotiated"],
      ["fine-tuning", "included"],
      ["deployment", "on-prem option"],
    ],
  },
];

export default function PricingTeaser() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="font-display font-semibold tracking-tight text-[40px] md:text-[56px] leading-[1.05] mb-12">
          Pick a tier. Or design your own.
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              className="font-mono border-2 border-charcoal p-5 bg-bone"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-[11px] uppercase tracking-widest opacity-60">
                  tier_{String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-tomato text-xs">{t.name.toLowerCase()}</div>
              </div>
              <div className="text-[28px] font-bold mb-4">{t.price}</div>
              <table className="w-full text-[12px] border-collapse">
                <tbody>
                  {t.rows.map(([k, v]) => (
                    <tr key={k} className="border-b border-charcoal/15">
                      <td className="py-1.5 pr-2 opacity-60">{k}</td>
                      <td className="py-1.5 text-right">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/pricing" className="text-tomato hover:underline">
            See full pricing →
          </Link>
        </div>
      </div>
    </section>
  );
}
