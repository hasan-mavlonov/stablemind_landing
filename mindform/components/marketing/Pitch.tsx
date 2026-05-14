import PullQuote from "./PullQuote";

export default function Pitch() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6">
        <PullQuote>
          Every AI today has the same voice. We make voices, plural.
        </PullQuote>

        <div className="mt-16 grid md:grid-cols-3 gap-10 max-w-[1080px] mx-auto">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-tomato mb-3 font-mono">
              what it is
            </div>
            <p className="text-[17px] leading-[1.6]">
              A personality layer is the bundle that turns a generic model into
              a specific someone. System prompt, memory schema, voice model,
              behavioral parameters: all versioned, all swappable, all yours.
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-tomato mb-3 font-mono">
              why now
            </div>
            <p className="text-[17px] leading-[1.6]">
              The hard part of multi-agent apps is not the model. It is the
              difference between agents. Without that difference, three voices
              are one voice repeated three times.
            </p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-tomato mb-3 font-mono">
              where it lives
            </div>
            <p className="text-[17px] leading-[1.6]">
              One API call. Pass a personality id, get the voice. Swap mid
              conversation, keep the memory. Same endpoint shape as
              /v1/chat/completions, so your stack does not change.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
