type Props = { className?: string; title?: string };

export default function Orin({ className, title = "Orin, the old salt" }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* heavy coat */}
      <path
        d="M22 230 L 36 168 L 80 158 L 120 158 L 164 168 L 178 230 Z"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* coat seam */}
      <line x1="100" y1="158" x2="100" y2="230" stroke="#1A1A1A" strokeWidth="2" />
      {/* scarf */}
      <path
        d="M62 158 Q 100 178, 138 158 L 142 178 Q 100 196, 58 178 Z"
        fill="#7A3CE8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* head */}
      <ellipse cx="100" cy="98" rx="52" ry="58" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      {/* sailor cap */}
      <path
        d="M44 70 C 50 46, 76 36, 100 36 C 124 36, 150 46, 156 70 L 152 78 L 48 78 Z"
        fill="#7A3CE8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="42" y="78" width="116" height="10" fill="#1A1A1A" />
      {/* deep-set eyes */}
      <path d="M70 102 Q 78 96, 86 102" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
      <path d="M114 102 Q 122 96, 130 102" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="78" cy="106" r="2.5" fill="#1A1A1A" />
      <circle cx="122" cy="106" r="2.5" fill="#1A1A1A" />
      {/* crow's feet */}
      <line x1="56" y1="100" x2="64" y2="104" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="106" x2="64" y2="108" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="136" y1="104" x2="144" y2="100" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="136" y1="108" x2="144" y2="106" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      {/* big white beard */}
      <path
        d="M60 124 C 60 156, 76 168, 100 168 C 124 168, 140 156, 140 124 C 132 138, 116 144, 100 144 C 84 144, 68 138, 60 124 Z"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* pipe */}
      <line x1="114" y1="138" x2="138" y2="148" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <rect x="136" y="142" width="10" height="10" fill="#7A3CE8" stroke="#1A1A1A" strokeWidth="2" />
    </svg>
  );
}
