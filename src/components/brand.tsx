export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="4" y="22" width="7" height="6" rx="1.5" className="fill-primary" />
      <rect x="12" y="17" width="7" height="11" rx="1.5" className="fill-primary/80" />
      <rect x="20" y="12" width="7" height="16" rx="1.5" className="fill-primary/60" />
      <path d="M23.5 2.5l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" className="fill-gold" />
    </svg>
  );
}

export function Brand() {
  return (
    <span className="flex items-center gap-2">
      <BrandMark />
      <span className="font-display text-xl font-semibold text-heading">Tiny Wins</span>
    </span>
  );
}

export function StepsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} aria-hidden="true" focusable="false">
      <rect width="360" height="260" className="fill-background" />
      <path d="M36 224V192H100V160H164V128H228V96H292V224Z" className="fill-primary" />
      <path d="M36 192H100M100 160H164M164 128H228M228 96H292" className="stroke-primary-foreground/40" strokeWidth="2" />
      <line x1="20" y1="224" x2="328" y2="224" className="stroke-heading/25" strokeWidth="2" strokeLinecap="round" />
      {([
        [68, 192, 0.36],
        [132, 160, 0.60],
        [196, 128, 0.84],
        [260, 96, 1.12],
      ] as const).map(([x, y, scale], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${scale})`}>
          <ellipse cx="0" cy="0" rx="10" ry="2" className="fill-heading" />
          <path d="M0 0Q-2 -22 1 -46" className="stroke-heading" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M0 -13Q-20 -12 -23 -29Q-4 -31 0 -13Z" className="fill-heading" />
          <path d="M0 -24Q18 -21 23 -39Q5 -40 0 -24Z" className="fill-sage stroke-heading" strokeWidth="1" />
          {i > 0 && <path d="M0 -34Q-16 -32 -17 -49Q-2 -48 0 -34Z" className="fill-sage stroke-heading" strokeWidth="1" />}
          {i > 1 && <path d="M1 -43Q13 -43 14 -59Q1 -57 1 -43Z" className="fill-heading" />}
        </g>
      ))}
      <path d="M313 26l5.2 10.6 11.7 1.7-8.5 8.3 2 11.7-10.4-5.5-10.5 5.5 2-11.7-8.5-8.3 11.8-1.7Z" className="fill-gold" />
    </svg>
  );
}
