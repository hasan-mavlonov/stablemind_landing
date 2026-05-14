type Props = { className?: string; title?: string };

export default function Ada({ className, title = "Ada, the patient mentor" }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* shoulders / body */}
      <path
        d="M30 230 C 30 175, 60 160, 100 160 C 140 160, 170 175, 170 230 Z"
        fill="#E8B53C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* collar */}
      <path
        d="M80 168 L 100 188 L 120 168"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* head */}
      <ellipse
        cx="100"
        cy="100"
        rx="56"
        ry="62"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      {/* hair bun */}
      <circle cx="100" cy="42" r="22" fill="#E8B53C" stroke="#1A1A1A" strokeWidth="2" />
      <path
        d="M44 90 C 44 55, 70 50, 100 50 C 130 50, 156 55, 156 90"
        fill="#E8B53C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* glasses */}
      <circle cx="78" cy="104" r="14" fill="none" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="122" cy="104" r="14" fill="none" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="92" y1="104" x2="108" y2="104" stroke="#1A1A1A" strokeWidth="2" />
      {/* eyes */}
      <circle cx="78" cy="104" r="3" fill="#1A1A1A" />
      <circle cx="122" cy="104" r="3" fill="#1A1A1A" />
      {/* mouth, gentle smile */}
      <path
        d="M88 130 Q 100 138, 112 130"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
