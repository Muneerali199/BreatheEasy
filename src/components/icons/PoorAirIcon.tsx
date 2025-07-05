import type { SVGProps } from "react";

export default function PoorAirIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <filter id="shadow-poor-icon" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
        </filter>
        <linearGradient id="grad-poor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#EF5350' }} />
          <stop offset="100%" style={{ stopColor: '#E53935' }} />
        </linearGradient>
      </defs>
      <g filter="url(#shadow-poor-icon)">
        <circle cx="32" cy="30" r="22" fill="url(#grad-poor)" />
        <path d="M25 23l14 14m0-14l-14 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}
