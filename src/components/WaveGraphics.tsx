import React from 'react';

// Exact Uraxium organic top wave path (fill: #1F1F1F or #222222 with warm accent)
export const UraxiumTopWave: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 900 150"
    preserveAspectRatio="none"
    className={`w-full block drop-shadow-md ${className}`}
    aria-hidden="true"
  >
    <defs>
      {/* Rich gradient matching Uraxium's warm dark palette */}
      <linearGradient id="uraxiumTopGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#222222" />
        <stop offset="40%" stopColor="#26231f" />
        <stop offset="70%" stopColor="#2c241c" />
        <stop offset="100%" stopColor="#222222" />
      </linearGradient>
      {/* Subtle gold accent edge along the bottom wave crest */}
      <linearGradient id="uraxiumTopStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F6DFA6" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#c9833b" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#F6DFA6" stopOpacity="0.4" />
      </linearGradient>
    </defs>
    
    {/* Main organic fluid wave shape from uraxium.vercel.app */}
    <path
      d="M 0 0 L 900 0 L 900 74 C 860 74, 840 110, 800 110 C 760 110, 730 75, 695 75 C 650 75, 620 104, 570 104 C 500 104, 430 52, 350 52 C 270 52, 230 104, 180 104 C 120 104, 60 72, 0 72 Z"
      fill="url(#uraxiumTopGrad)"
      stroke="url(#uraxiumTopStroke)"
      strokeWidth="1.5"
    />
  </svg>
);

// Exact Uraxium organic footer wave (viewBox: 0 400 900 200)
export const UraxiumBottomWave: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 900 200"
    preserveAspectRatio="none"
    className={`w-full block ${className}`}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="uraxiumBottomGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#222222" />
        <stop offset="40%" stopColor="#26231f" />
        <stop offset="70%" stopColor="#2c241c" />
        <stop offset="100%" stopColor="#222222" />
      </linearGradient>
      <linearGradient id="uraxiumBottomStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#F6DFA6" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#c9833b" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#F6DFA6" stopOpacity="0.4" />
      </linearGradient>
    </defs>

    {/* Exact path from uraxium.vercel.app footer */}
    <path
      d="M0 125 C 40 125, 80 95, 115 95 C 155 95, 195 122, 235 122 C 295 122, 355 72, 415 72 C 475 72, 520 114, 580 114 C 645 114, 705 35, 765 35 C 815 35, 860 65, 900 65 L 900 200 L 0 200 Z"
      fill="url(#uraxiumBottomGrad)"
      stroke="url(#uraxiumBottomStroke)"
      strokeWidth="1.5"
    />
  </svg>
);
