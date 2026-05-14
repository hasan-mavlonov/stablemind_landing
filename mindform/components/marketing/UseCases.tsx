type UseCase = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

function Joystick() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12">
      <rect x="6" y="34" width="52" height="24" fill="#3C7AE8" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="20" cy="46" r="6" fill="#E84A3C" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="42" cy="46" r="6" fill="#E8B53C" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="32" y1="34" x2="32" y2="14" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="12" r="5" fill="#7A3CE8" stroke="#1A1A1A" strokeWidth="2" />
    </svg>
  );
}
function Heart() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12">
      <path
        d="M32 56 C 8 38, 8 16, 22 16 C 28 16, 32 22, 32 22 C 32 22, 36 16, 42 16 C 56 16, 56 38, 32 56 Z"
        fill="#E84A3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Phone() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12">
      <rect x="18" y="6" width="28" height="52" rx="3" fill="#E8B53C" stroke="#1A1A1A" strokeWidth="2" />
      <rect x="22" y="14" width="20" height="32" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="32" cy="52" r="2" fill="#1A1A1A" />
    </svg>
  );
}
function Robot() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12">
      <rect x="14" y="20" width="36" height="32" fill="#4A8B3C" stroke="#1A1A1A" strokeWidth="2" />
      <rect x="22" y="28" width="6" height="6" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      <rect x="36" y="28" width="6" height="6" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="24" y1="42" x2="40" y2="42" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="12" x2="32" y2="20" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="32" cy="10" r="3" fill="#E84A3C" stroke="#1A1A1A" strokeWidth="2" />
    </svg>
  );
}

const cases: UseCase[] = [
  {
    title: "Game NPCs.",
    body:
      "Stop writing the same wizard. Give every shopkeeper, rival, and bartender a real voice with persistent memory.",
    icon: <Joystick />,
  },
  {
    title: "Companion apps.",
    body:
      "Some users want patience. Some want chaos. Ship a roster, let the user pick, swap mid-session without losing context.",
    icon: <Heart />,
  },
  {
    title: "AI influencers.",
    body:
      "A consistent on-camera voice with brand-safe behavior bounds. Generate scripts, captions, and DMs in one personality.",
    icon: <Phone />,
  },
  {
    title: "Industrial robots.",
    body:
      "Operators talk to machines all day. A calm, terse foreman beats a chatbot. We ship the foreman.",
    icon: <Robot />,
  },
];

export default function UseCases() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="font-display font-semibold tracking-tight text-[40px] md:text-[56px] leading-[1.05] mb-12">
          Where it shows up.
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {cases.map((c) => (
            <article
              key={c.title}
              className="border-2 border-charcoal bg-bone p-6 md:p-8 flex gap-6 wobble-target"
              style={{ borderRadius: 2 }}
            >
              <div className="shrink-0">{c.icon}</div>
              <div>
                <h3 className="font-display font-semibold text-[24px] leading-tight mb-2">
                  {c.title}
                </h3>
                <p className="text-[15px] leading-relaxed opacity-85">{c.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
