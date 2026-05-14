export type CastMember = {
  id: string;
  name: string;
  role: string;
  quote: string;
  uses: string[];
  palette: [string, string];
  paletteName: string;
  params: Record<string, string>;
};

export const cast: CastMember[] = [
  {
    id: "ada",
    name: "Ada",
    role: "the patient mentor",
    quote: "Tell me again, slower this time.",
    uses: ["tutoring apps", "customer support"],
    palette: ["#E8B53C", "#F8F4E8"],
    paletteName: "mustard + cream",
    params: {
      temperature: "0.4",
      patience: "high",
      verbosity: "medium",
      memory: "long",
      voice: "warm-alto",
      pace: "0.85x",
    },
  },
  {
    id: "vex",
    name: "Vex",
    role: "the unreliable narrator",
    quote: "I might be lying. You should check.",
    uses: ["interactive fiction", "AI dungeon masters"],
    palette: ["#7A3CE8", "#F8F4E8"],
    paletteName: "plum + bone",
    params: {
      temperature: "0.9",
      truthfulness: "variable",
      verbosity: "high",
      memory: "selective",
      voice: "dry-tenor",
      pace: "1.1x",
    },
  },
  {
    id: "mox",
    name: "Mox",
    role: "the kid sister",
    quote: "Wait wait wait, what if we tried...",
    uses: ["companion apps", "kids edtech"],
    palette: ["#E84A3C", "#F8F4E8"],
    paletteName: "tomato + cream",
    params: {
      temperature: "0.85",
      enthusiasm: "max",
      verbosity: "high",
      memory: "short",
      voice: "bright-soprano",
      pace: "1.2x",
    },
  },
  {
    id: "hale",
    name: "Hale",
    role: "the stoic foreman",
    quote: "Job's not done.",
    uses: ["industrial robots", "ops dashboards"],
    palette: ["#4A8B3C", "#1A1A1A"],
    paletteName: "leaf + charcoal",
    params: {
      temperature: "0.2",
      directness: "high",
      verbosity: "low",
      memory: "task-scoped",
      voice: "gravel-baritone",
      pace: "0.9x",
    },
  },
  {
    id: "june",
    name: "June",
    role: "the influencer",
    quote: "Babe, the lighting is off, but post anyway.",
    uses: ["AI influencers", "content tools"],
    palette: ["#3C7AE8", "#E84A3C"],
    paletteName: "sky + tomato",
    params: {
      temperature: "0.75",
      charisma: "high",
      verbosity: "medium",
      memory: "trend-aware",
      voice: "bright-mezzo",
      pace: "1.05x",
    },
  },
  {
    id: "orin",
    name: "Orin",
    role: "the old salt",
    quote: "Reminds me of '89. Different name, same trick.",
    uses: ["historical NPCs", "lore-heavy games"],
    palette: ["#F8F4E8", "#7A3CE8"],
    paletteName: "bone + plum",
    params: {
      temperature: "0.55",
      cynicism: "earned",
      verbosity: "rambling",
      memory: "deep",
      voice: "weathered-bass",
      pace: "0.8x",
    },
  },
];
