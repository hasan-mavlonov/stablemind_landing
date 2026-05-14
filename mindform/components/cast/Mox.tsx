type Props = { className?: string; title?: string };

export default function Mox({ className, title = "Mox, the kid sister" }: Props) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* overalls / body */}
      <path
        d="M40 230 L 50 168 L 100 156 L 150 168 L 160 230 Z"
        fill="#E84A3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* shirt collar */}
      <path
        d="M70 168 L 100 184 L 130 168 L 130 152 L 100 144 L 70 152 Z"
        fill="#F8F4E8"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* head, round */}
      <circle cx="100" cy="96" r="60" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      {/* pigtails */}
      <ellipse cx="44" cy="92" rx="12" ry="22" fill="#E84A3C" stroke="#1A1A1A" strokeWidth="2" />
      <ellipse cx="156" cy="92" rx="12" ry="22" fill="#E84A3C" stroke="#1A1A1A" strokeWidth="2" />
      {/* hair top */}
      <path
        d="M44 70 C 50 38, 80 28, 100 28 C 124 28, 154 40, 156 70 C 138 60, 120 56, 100 56 C 82 56, 64 60, 44 70 Z"
        fill="#E84A3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* big excited eyes */}
      <circle cx="80" cy="100" r="8" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="120" cy="100" r="8" fill="#F8F4E8" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="82" cy="102" r="4" fill="#1A1A1A" />
      <circle cx="122" cy="102" r="4" fill="#1A1A1A" />
      {/* open-mouth grin */}
      <path
        d="M82 124 Q 100 142, 118 124 Q 100 138, 82 124 Z"
        fill="#E84A3C"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* freckles */}
      <circle cx="74" cy="118" r="1.5" fill="#1A1A1A" />
      <circle cx="68" cy="112" r="1.5" fill="#1A1A1A" />
      <circle cx="126" cy="118" r="1.5" fill="#1A1A1A" />
      <circle cx="132" cy="112" r="1.5" fill="#1A1A1A" />
    </svg>
  );
}
