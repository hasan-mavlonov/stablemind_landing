import CodeBlock from "@/components/system/CodeBlock";
import MetricCard from "@/components/system/MetricCard";

export default function SystemPreview() {
  return (
    <section className="system-surface border-t border-tomato">
      <div className="mx-auto max-w-[1280px] px-6 py-24 md:py-32">
        <h2 className="font-mono font-bold text-[28px] md:text-[40px] tracking-tight mb-3">
          One API. Any personality.
        </h2>
        <p className="font-mono text-sm text-offwhite/60 max-w-xl mb-10">
          Same conversation, different voice. Memory carries over. The endpoint
          shape mirrors what your stack already speaks.
        </p>

        <CodeBlock />

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          <MetricCard
            label="latency"
            value="37 ms"
            caption="median, /v1/chat/completions, p50 across regions"
          />
          <MetricCard
            label="voices"
            value="6 + 47"
            caption="six voices in production, forty seven in beta access"
          />
          <MetricCard
            label="compatible"
            value="OpenAI shape"
            caption="drop-in replacement at /v1/chat/completions"
          />
        </div>
      </div>
    </section>
  );
}
