import type { SVGProps } from "react";

export default function ModerateAirIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="shadow-mod-icon" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
        </filter>
        <linearGradient id="grad-mod" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFD54F' }} />
          <stop offset="100%" style={{ stopColor: '#FFC107' }} />
        </linearGradient>
      </defs>
      <g filter="url(#shadow-mod-icon)">
        <circle cx="32" cy="30" r="22" fill="url(#grad-mod)" />
        <path d="M32 20.5V30l6.7 3.3" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}
