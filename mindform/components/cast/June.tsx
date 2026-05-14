type Props = { className?: string; title?: string };

export default function June({ className, title = "June, the influencer" }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* shoulders, off-the-shoulder top */}
      <path
        d="M30 230 C 30 178, 60 162, 100 162 C 140 162, 170 178, 170 230 Z"
        fill="#3C7AE8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* neckline scoop */}
      <path
        d="M70 162 Q 100 184, 130 162"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* head */}
      <ellipse cx="100" cy="100" rx="54" ry="60" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      {/* long hair behind */}
      <path
        d="M46 100 C 38 60, 70 36, 100 36 C 132 36, 162 60, 154 100 L 154 200 C 138 188, 124 184, 100 184 C 76 184, 62 188, 46 200 Z"
        fill="#1A1A1A"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* face cutout */}
      <ellipse cx="100" cy="104" rx="48" ry="56" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      {/* sunglasses */}
      <rect x="58" y="90" width="34" height="20" rx="6" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth="2" />
      <rect x="108" y="90" width="34" height="20" rx="6" fill="#1A1A1A" stroke="#1A1A1A" strokeWidth="2" />
      <line x1="92" y1="100" x2="108" y2="100" stroke="#1A1A1A" strokeWidth="2" />
      {/* lips */}
      <path
        d="M84 134 Q 92 130, 100 134 Q 108 130, 116 134 Q 108 144, 100 144 Q 92 144, 84 134 Z"
        fill="#E84A3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* hoop earring */}
      <circle cx="48" cy="116" r="6" fill="none" stroke="#E84A3C" strokeWidth="3" />
      {/* lens highlight */}
      <line x1="64" y1="94" x2="72" y2="94" stroke="#F8F4E8" strokeWidth="2" strokeLinecap="round" />
      <line x1="114" y1="94" x2="122" y2="94" stroke="#F8F4E8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
