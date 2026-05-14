type Props = {
  value: string;
  label: string;
  caption?: string;
};

export default function MetricCard({ value, label, caption }: Props) {
  return (
    <div
      className="border border-tomato p-5 font-mono"
      style={{ borderRadius: 2 }}
    >
      <div className="text-[10px] uppercase tracking-widest text-tomato">{label}</div>
      <div className="mt-3 text-[28px] md:text-[32px] font-bold text-offwhite leading-tight">
        {value}
      </div>
      {caption ? (
        <div className="mt-2 text-[11px] text-offwhite/50 leading-snug">{caption}</div>
      ) : null}
    </div>
  );
}
