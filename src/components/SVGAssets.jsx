import React from 'react';

// Common placeholder style: dark grey fills with slight orange accents or strokes
const primary = "#111";
const stroke = "#333";
const accent = "#FF6B00";

export const CameraBody = ({ className, ...props }) => (
  <svg width="200" height="150" viewBox="0 0 200 150" fill="none" className={className} {...props}>
    <rect x="20" y="40" width="160" height="100" rx="10" fill={primary} stroke={stroke} strokeWidth="4"/>
    {/* Grip */}
    <rect x="20" y="40" width="40" height="100" rx="10" fill="#1a1a1a" />
    {/* Mount */}
    <circle cx="100" cy="90" r="40" fill={primary} stroke={stroke} strokeWidth="4"/>
    <circle cx="100" cy="90" r="30" fill="#000" />
    {/* Amber glowing LCD (small top screen) */}
    <rect x="120" y="40" width="40" height="10" fill="rgba(255, 107, 0, 0.4)" />
    {/* Viewfinder */}
    <rect x="75" y="10" width="50" height="30" rx="5" fill={primary} stroke={stroke} strokeWidth="4"/>
  </svg>
);

export const Lens = ({ className, ...props }) => (
  <svg width="120" height="160" viewBox="0 0 120 160" fill="none" className={className} {...props}>
    <rect x="20" y="20" width="80" height="120" rx="5" fill={primary} stroke={stroke} strokeWidth="4"/>
    <rect x="15" y="30" width="90" height="20" fill="#1a1a1a" />
    <rect x="15" y="70" width="90" height="40" fill="#1a1a1a" />
    <line x1="20" y1="130" x2="100" y2="130" stroke={accent} strokeWidth="2" />
  </svg>
);

export const LensHood = ({ className, ...props }) => (
  <svg width="140" height="80" viewBox="0 0 140 80" fill="none" className={className} {...props}>
    <path d="M20 80 L0 0 L140 0 L120 80 Z" fill={primary} stroke={stroke} strokeWidth="4" />
  </svg>
);

export const TripodLegs = ({ className, ...props }) => (
  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className={className} {...props}>
    <line x1="150" y1="20" x2="150" y2="280" stroke={primary} strokeWidth="16" strokeLinecap="round" />
    <line x1="145" y1="20" x2="40" y2="280" stroke={primary} strokeWidth="12" strokeLinecap="round" />
    <line x1="155" y1="20" x2="260" y2="280" stroke={primary} strokeWidth="12" strokeLinecap="round" />
    {/* Joints */}
    <rect x="130" y="0" width="40" height="40" rx="5" fill="#1a1a1a" stroke={stroke} strokeWidth="4"/>
  </svg>
);

export const Recorder = ({ className, ...props }) => (
  <svg width="80" height="120" viewBox="0 0 80 120" fill="none" className={className} {...props}>
    <rect x="10" y="20" width="60" height="90" rx="5" fill={primary} stroke={stroke} strokeWidth="4"/>
    {/* Screen */}
    <rect x="20" y="30" width="40" height="30" fill="rgba(255, 107, 0, 0.4)" />
    {/* Buttons */}
    <circle cx="40" cy="80" r="10" fill={accent} opacity="0.8" />
  </svg>
);

export const Microphone = ({ className, ...props }) => (
  <svg width="100" height="80" viewBox="0 0 100 80" fill="none" className={className} {...props}>
    {/* Left capsule */}
    <ellipse cx="30" cy="40" rx="15" ry="30" transform="rotate(45 30 40)" fill={primary} stroke={stroke} strokeWidth="2"/>
    <ellipse cx="30" cy="40" rx="10" ry="25" transform="rotate(45 30 40)" fill="#222" />
    {/* Right capsule */}
    <ellipse cx="70" cy="40" rx="15" ry="30" transform="rotate(-45 70 40)" fill={primary} stroke={stroke} strokeWidth="2"/>
    <ellipse cx="70" cy="40" rx="10" ry="25" transform="rotate(-45 70 40)" fill="#222" />
  </svg>
);

export const FluidHead = ({ className, ...props }) => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className={className} {...props}>
    <rect x="30" y="20" width="60" height="60" rx="10" fill={primary} stroke={stroke} strokeWidth="4"/>
    <rect x="10" y="10" width="100" height="15" fill="#1a1a1a" />
    {/* Pan handle */}
    <line x1="90" y1="50" x2="160" y2="80" stroke={primary} strokeWidth="8" strokeLinecap="round"/>
  </svg>
);
