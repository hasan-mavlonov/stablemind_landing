type Props = { className?: string; title?: string };

export default function Hale({ className, title = "Hale, the stoic foreman" }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* jacket, broad square shoulders */}
      <path
        d="M22 230 L 28 170 L 80 158 L 120 158 L 172 170 L 178 230 Z"
        fill="#4A8B3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* jacket center */}
      <path
        d="M88 158 L 100 230 L 112 158 Z"
        fill="#1A1A1A"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* head, square jaw */}
      <path
        d="M52 152 L 50 88 C 50 56, 72 38, 100 38 C 128 38, 150 56, 150 88 L 148 152 Z"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* hard hat */}
      <path
        d="M42 70 C 52 48, 76 38, 100 38 C 124 38, 148 48, 158 70 Z"
        fill="#4A8B3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="38" y="68" width="124" height="8" fill="#1A1A1A" />
      {/* heavy brow */}
      <rect x="66" y="96" width="22" height="5" fill="#1A1A1A" />
      <rect x="112" y="96" width="22" height="5" fill="#1A1A1A" />
      {/* eyes, narrow */}
      <line x1="70" y1="110" x2="86" y2="110" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      <line x1="114" y1="110" x2="130" y2="110" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
      {/* mustache */}
      <path
        d="M76 132 Q 100 142, 124 132 Q 116 138, 100 138 Q 84 138, 76 132 Z"
        fill="#1A1A1A"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* flat-line mouth */}
      <line x1="86" y1="146" x2="114" y2="146" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
