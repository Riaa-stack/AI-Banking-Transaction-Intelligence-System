import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, Skull, Coins, Scan, Radar, Shield } from 'lucide-react';

export default function CentralNetworkGraphic({ isDark = true }) {
  // SVG coordinates for tracks and nodes
  // Upper Left Track: Hacker transaction
  const hackerPath = "M 80 370 L 220 290 Q 235 282 250 290 L 360 355 Q 375 363 390 355 L 485 300";
  
  // Lower Left Track: Legitimate transaction
  const legitPath = "M 110 520 L 300 410 Q 315 402 330 410 L 400 450 Q 415 458 430 450 L 500 410";

  // Upper Right Track: Transaction Remedied (Purple)
  const remediedPath = "M 610 270 L 730 200 Q 745 192 760 200 L 850 252 Q 865 260 880 252 L 980 195 Q 995 187 1010 195 L 1060 225";

  // Lower Right Track: Threat Detected (Orange)
  const threatPath = "M 605 365 L 720 430 Q 735 438 750 430 L 850 372 Q 865 364 880 372 L 970 425 Q 985 433 1000 425 L 1050 395";

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none overflow-hidden my-4">
      
      {/* Background Ambient Radial Glows */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className={`w-[500px] h-[300px] rounded-full filter blur-[90px] opacity-25 transition-colors duration-700 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-orange-900/30' 
            : 'bg-gradient-to-r from-purple-400/20 via-indigo-300/20 to-orange-400/20'
        }`} />
      </div>

      <svg 
        viewBox="0 0 1100 600" 
        className="w-full h-auto drop-shadow-2xl overflow-visible"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous Glow Filters */}
          <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.75" />
            <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#7c3aed" floodOpacity="0.4" />
          </filter>
          
          <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f97316" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#ff6444" floodOpacity="0.4" />
          </filter>

          <filter id="coreShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="25" stdDeviation="20" floodColor="#000000" floodOpacity={isDark ? "0.85" : "0.35"} />
          </filter>

          {/* Gradients for tracks */}
          <linearGradient id="purpleTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={isDark ? "0.2" : "0.15"} />
            <stop offset="60%" stopColor="#8b5cf6" stopOpacity={isDark ? "0.3" : "0.22"} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={isDark ? "0.1" : "0.08"} />
          </linearGradient>

          <linearGradient id="orangeTrackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity={isDark ? "0.2" : "0.15"} />
            <stop offset="60%" stopColor="#ff6444" stopOpacity={isDark ? "0.3" : "0.22"} />
            <stop offset="100%" stopColor="#ea580c" stopOpacity={isDark ? "0.1" : "0.08"} />
          </linearGradient>

          {/* Core Surface Tile Gradients */}
          <linearGradient id="purpleTileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="60%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          <linearGradient id="orangeTileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="60%" stopColor="#ff6444" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. LEFT SIDE TRACKS (Dark Stealth Ingestion Lanes)              */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* --- TRACK 1: HACKER TRANSACTION (Upper Left) --- */}
        <g opacity={isDark ? "0.85" : "0.9"}>
          {/* Roadbed surface */}
          <path 
            d={hackerPath} 
            stroke={isDark ? "#161922" : "#e2e8f0"} 
            strokeWidth="38" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Outer edge rails */}
          <path 
            d={hackerPath} 
            stroke={isDark ? "#282c39" : "#cbd5e1"} 
            strokeWidth="40" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity="0.5"
          />
          <path 
            d={hackerPath} 
            stroke={isDark ? "#12141a" : "#f1f5f9"} 
            strokeWidth="36" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          {/* Dashed Centerline */}
          <path 
            d={hackerPath} 
            stroke={isDark ? "#475569" : "#94a3b8"} 
            strokeWidth="1.5" 
            strokeDasharray="6 8" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.8"
          />
          {/* Moving Traffic Packet */}
          <circle r="3" fill="#ef4444" opacity="0.9">
            <animateMotion dur="4.2s" repeatCount="indefinite" path={hackerPath} />
          </circle>
          <circle r="1.5" fill="#ffffff">
            <animateMotion dur="4.2s" repeatCount="indefinite" path={hackerPath} />
          </circle>
        </g>

        {/* --- TRACK 2: LEGITIMATE TRANSACTION (Lower Left) --- */}
        <g opacity={isDark ? "0.85" : "0.9"}>
          {/* Roadbed surface */}
          <path 
            d={legitPath} 
            stroke={isDark ? "#161922" : "#e2e8f0"} 
            strokeWidth="38" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Outer edge rails */}
          <path 
            d={legitPath} 
            stroke={isDark ? "#282c39" : "#cbd5e1"} 
            strokeWidth="40" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity="0.5"
          />
          <path 
            d={legitPath} 
            stroke={isDark ? "#12141a" : "#f1f5f9"} 
            strokeWidth="36" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          {/* Dashed Centerline */}
          <path 
            d={legitPath} 
            stroke={isDark ? "#475569" : "#94a3b8"} 
            strokeWidth="1.5" 
            strokeDasharray="6 8" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.8"
          />
          {/* Moving Traffic Packet */}
          <circle r="3" fill="#38bdf8" opacity="0.9">
            <animateMotion dur="3.8s" repeatCount="indefinite" path={legitPath} />
          </circle>
          <circle r="1.5" fill="#ffffff">
            <animateMotion dur="3.8s" repeatCount="indefinite" path={legitPath} />
          </circle>
        </g>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. RIGHT SIDE TRACKS (Luminous Neon Remediation & Threat Lanes) */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* --- TRACK 3: TRANSACTION REMEDIED (Upper Right - PURPLE) --- */}
        <g>
          {/* Glowing Translucent Roadbed */}
          <path 
            d={remediedPath} 
            stroke="url(#purpleTrackGrad)" 
            strokeWidth="38" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Glowing Neon Rails */}
          <path 
            d={remediedPath} 
            stroke="#8b5cf6" 
            strokeWidth="40" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity={isDark ? "0.35" : "0.25"}
            filter="url(#purpleGlow)"
          />
          <path 
            d={remediedPath} 
            stroke={isDark ? "#6d28d9" : "#a78bfa"} 
            strokeWidth="39" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity={isDark ? "0.6" : "0.4"}
          />
          <path 
            d={remediedPath} 
            stroke={isDark ? "#171026" : "#f5f3ff"} 
            strokeWidth="34" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          {/* Neon Purple Dashed Centerline with Animation */}
          <path 
            d={remediedPath} 
            stroke="#c084fc" 
            strokeWidth="1.8" 
            strokeDasharray="6 8" 
            strokeLinecap="round" 
            fill="none" 
            filter="url(#purpleGlow)"
          />
          {/* Pulsing Energy Packets */}
          <circle r="4" fill="#c084fc" filter="url(#purpleGlow)">
            <animateMotion dur="3.4s" repeatCount="indefinite" path={remediedPath} />
          </circle>
          <circle r="2" fill="#ffffff">
            <animateMotion dur="3.4s" repeatCount="indefinite" path={remediedPath} />
          </circle>
        </g>

        {/* --- TRACK 4: THREAT DETECTED (Lower Right - ORANGE) --- */}
        <g>
          {/* Glowing Translucent Roadbed */}
          <path 
            d={threatPath} 
            stroke="url(#orangeTrackGrad)" 
            strokeWidth="38" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Glowing Neon Rails */}
          <path 
            d={threatPath} 
            stroke="#f97316" 
            strokeWidth="40" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity={isDark ? "0.35" : "0.25"}
            filter="url(#orangeGlow)"
          />
          <path 
            d={threatPath} 
            stroke={isDark ? "#ea580c" : "#fdba74"} 
            strokeWidth="39" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
            opacity={isDark ? "0.6" : "0.4"}
          />
          <path 
            d={threatPath} 
            stroke={isDark ? "#241410" : "#fff7ed"} 
            strokeWidth="34" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          {/* Neon Orange Dashed Centerline with Animation */}
          <path 
            d={threatPath} 
            stroke="#fb923c" 
            strokeWidth="1.8" 
            strokeDasharray="6 8" 
            strokeLinecap="round" 
            fill="none" 
            filter="url(#orangeGlow)"
          />
          {/* Pulsing Energy Packets */}
          <circle r="4" fill="#fb923c" filter="url(#orangeGlow)">
            <animateMotion dur="3.2s" repeatCount="indefinite" path={threatPath} />
          </circle>
          <circle r="2" fill="#ffffff">
            <animateMotion dur="3.2s" repeatCount="indefinite" path={threatPath} />
          </circle>
        </g>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. TRACK LABELS & CIRCULAR NODES                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* Node 1: hacker transaction */}
        <g transform="translate(195, 305)">
          <text 
            x="0" 
            y="-22" 
            fill={isDark ? "#94a3b8" : "#64748b"} 
            fontSize="11" 
            fontFamily="monospace" 
            letterSpacing="0.5px"
            transform="rotate(-26)"
            textAnchor="middle"
          >
            hacker transaction
          </text>
          <circle r="12" fill={isDark ? "#191c25" : "#f1f5f9"} stroke={isDark ? "#333849" : "#cbd5e1"} strokeWidth="1.5" />
          <Skull className="h-3.5 w-3.5 text-slate-400" x="-7" y="-7" />
        </g>

        {/* Node 2: legitimate transaction */}
        <g transform="translate(245, 442)">
          <text 
            x="0" 
            y="-22" 
            fill={isDark ? "#94a3b8" : "#64748b"} 
            fontSize="11" 
            fontFamily="monospace" 
            letterSpacing="0.5px"
            transform="rotate(-26)"
            textAnchor="middle"
          >
            legitimate transaction
          </text>
          <circle r="12" fill={isDark ? "#191c25" : "#f1f5f9"} stroke={isDark ? "#333849" : "#cbd5e1"} strokeWidth="1.5" />
          <Coins className="h-3.5 w-3.5 text-slate-400" x="-7" y="-7" />
        </g>

        {/* Node 3: transaction remedied */}
        <g transform="translate(855, 250)">
          <text 
            x="0" 
            y="-22" 
            fill={isDark ? "#c084fc" : "#7c3aed"} 
            fontSize="11" 
            fontFamily="monospace" 
            fontWeight="bold" 
            letterSpacing="0.5px"
            transform="rotate(-26)"
            textAnchor="middle"
          >
            transaction remedied
          </text>
          {/* Pulsing Halo */}
          <circle r="16" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="12;18;12" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle r="12" fill={isDark ? "#241738" : "#f5f3ff"} stroke="#8b5cf6" strokeWidth="1.8" filter="url(#purpleGlow)" />
          <ShieldCheck className="h-3.5 w-3.5 text-purple-400" x="-7" y="-7" />
        </g>

        {/* Node 4: threat detected */}
        <g transform="translate(870, 368)">
          <text 
            x="0" 
            y="32" 
            fill={isDark ? "#fb923c" : "#ea580c"} 
            fontSize="11" 
            fontFamily="monospace" 
            fontWeight="bold" 
            letterSpacing="0.5px"
            transform="rotate(-26)"
            textAnchor="middle"
          >
            threat detected
          </text>
          {/* Pulsing Halo */}
          <circle r="16" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.4">
            <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle r="12" fill={isDark ? "#2e1710" : "#fff7ed"} stroke="#f97316" strokeWidth="1.8" filter="url(#orangeGlow)" />
          <AlertTriangle className="h-3.5 w-3.5 text-orange-400" x="-7" y="-7" />
        </g>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 4. CENTRAL FLOATING MULTI-LAYERED SECURITY HUB                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        <motion.g
          animate={{ y: [-7, 7, -7] }}
          transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
          filter="url(#coreShadow)"
        >
          {/* Base Floor Ambient Shadow */}
          <ellipse 
            cx="550" 
            cy="365" 
            rx="130" 
            ry="60" 
            fill="#000000" 
            opacity={isDark ? "0.6" : "0.2"} 
          />

          {/* Layer 3 (Deep Bottom Slab Extrusion) */}
          <g transform="translate(550, 342) scale(1, 0.577) rotate(-45)">
            <rect 
              x="-82" 
              y="-82" 
              width="164" 
              height="164" 
              rx="28" 
              fill={isDark ? "#090a0f" : "#cbd5e1"} 
              stroke={isDark ? "#171a24" : "#94a3b8"} 
              strokeWidth="2" 
            />
          </g>

          {/* Layer 2 (Middle Slab Extrusion) */}
          <g transform="translate(550, 330) scale(1, 0.577) rotate(-45)">
            <rect 
              x="-82" 
              y="-82" 
              width="164" 
              height="164" 
              rx="28" 
              fill={isDark ? "#11141c" : "#e2e8f0"} 
              stroke={isDark ? "#222735" : "#cbd5e1"} 
              strokeWidth="2" 
            />
          </g>

          {/* Layer 1 (Top Primary Plate Surface) */}
          <g transform="translate(550, 318) scale(1, 0.577) rotate(-45)">
            {/* Top Plate Base */}
            <rect 
              x="-82" 
              y="-82" 
              width="164" 
              height="164" 
              rx="28" 
              fill={isDark ? "#171b26" : "#ffffff"} 
              stroke={isDark ? "#32384a" : "#cbd5e1"} 
              strokeWidth="2.5" 
            />

            {/* Inset Plate Rim */}
            <rect 
              x="-76" 
              y="-76" 
              width="152" 
              height="152" 
              rx="24" 
              fill={isDark ? "#10121a" : "#f8fafc"} 
              stroke={isDark ? "#242938" : "#e2e8f0"} 
              strokeWidth="1.5" 
            />

            {/* ── 2x2 GRID OF TILES ON TOP SURFACE ── */}

            {/* 1. TOP TILE: Vibrant Glowing Purple */}
            <g transform="translate(0, -36)">
              <rect 
                x="-30" 
                y="-30" 
                width="60" 
                height="60" 
                rx="16" 
                fill="url(#purpleTileGrad)" 
                stroke="#c084fc" 
                strokeWidth="1.2" 
                filter="url(#purpleGlow)"
              />
              {/* Inner highlight bevel */}
              <rect 
                x="-27" 
                y="-27" 
                width="54" 
                height="54" 
                rx="13" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="0.8" 
                opacity="0.3"
              />
            </g>

            {/* 2. BOTTOM TILE: Vibrant Glowing Coral/Orange */}
            <g transform="translate(0, 36)">
              <rect 
                x="-30" 
                y="-30" 
                width="60" 
                height="60" 
                rx="16" 
                fill="url(#orangeTileGrad)" 
                stroke="#fdba74" 
                strokeWidth="1.2" 
                filter="url(#orangeGlow)"
              />
              {/* Inner highlight bevel */}
              <rect 
                x="-27" 
                y="-27" 
                width="54" 
                height="54" 
                rx="13" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="0.8" 
                opacity="0.3"
              />
            </g>

            {/* 3. LEFT TILE: Dark Tile with Biometric / Face-ID Outline */}
            <g transform="translate(-36, 0)">
              <rect 
                x="-30" 
                y="-30" 
                width="60" 
                height="60" 
                rx="16" 
                fill={isDark ? "#171a24" : "#edf2f7"} 
                stroke={isDark ? "#2c3345" : "#cbd5e1"} 
                strokeWidth="1.5" 
              />
              {/* Biometric vector icon */}
              <g transform="scale(0.85) translate(-12, -12)" stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 7V4a2 2 0 0 1 2-2h3" />
                <path d="M17 2h3a2 2 0 0 1 2 2v3" />
                <path d="M2 17v3a2 2 0 0 0 2 2h3" />
                <path d="M17 22h3a2 2 0 0 0 2-2v-3" />
                <circle cx="12" cy="12" r="3" />
                <path d="M9 12a3 3 0 0 1 6 0" />
              </g>
            </g>

            {/* 4. RIGHT TILE: Dark Tile with Radar / Search Outline */}
            <g transform="translate(36, 0)">
              <rect 
                x="-30" 
                y="-30" 
                width="60" 
                height="60" 
                rx="16" 
                fill={isDark ? "#171a24" : "#edf2f7"} 
                stroke={isDark ? "#2c3345" : "#cbd5e1"} 
                strokeWidth="1.5" 
              />
              {/* Radar/Search vector icon */}
              <g transform="scale(0.85) translate(-12, -12)" stroke={isDark ? "#94a3b8" : "#475569"} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
                <path d="M11 8a3 3 0 0 1 3 3" />
              </g>
            </g>

          </g>
        </motion.g>

      </svg>
    </div>
  );
}
