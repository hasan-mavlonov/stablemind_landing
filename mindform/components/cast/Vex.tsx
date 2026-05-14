type Props = { className?: string; title?: string };

export default function Vex({ className, title = "Vex, the unreliable narrator" }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* high-collared cloak */}
      <path
        d="M20 230 L 40 168 L 100 152 L 160 168 L 180 230 Z"
        fill="#7A3CE8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* head, asymmetric mask shape */}
      <path
        d="M52 96 C 52 50, 76 30, 100 30 C 132 30, 152 56, 150 102 C 148 138, 132 162, 100 162 C 70 162, 52 138, 52 96 Z"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* hood shadow */}
      <path
        d="M48 90 C 56 64, 76 50, 100 48 C 130 46, 150 70, 154 96 L 150 96 C 144 78, 126 64, 100 64 C 76 64, 60 76, 52 96 Z"
        fill="#7A3CE8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* one eye open, one shadowed */}
      <circle cx="80" cy="108" r="4" fill="#1A1A1A" />
      <path
        d="M114 102 L 132 106 L 130 116 L 112 112 Z"
        fill="#1A1A1A"
        strokeLinejoin="round"
      />
      {/* crooked mouth */}
      <path
        d="M82 138 L 96 134 L 110 140 L 124 132"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* tiny tilted star, accent */}
      <path
        d="M150 50 l 4 8 l 8 2 l -6 6 l 2 8 l -8 -4 l -8 4 l 2 -8 l -6 -6 l 8 -2 z"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
