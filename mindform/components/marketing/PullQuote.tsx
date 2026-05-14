export default function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      className="font-display font-semibold tracking-tight text-center mx-auto leading-[1.1]"
      style={{ fontSize: "clamp(32px, 5.5vw, 56px)", maxWidth: 900 }}
    >
      {children}
    </blockquote>
  );
}
