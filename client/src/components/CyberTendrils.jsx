import React from 'react';

/**
 * CyberTendrils — Fiber-optic neural data streams connecting KPI summary cards
 * down to the telemetry chart bars, with an animated horizontal laser baseline beam.
 * Matches the user's mockup with streaming particles and cubic Bézier curves.
 */
const CyberTendrils = () => {
  return (
    <div className="cyber-tendrils-container" aria-hidden="true">
      <style>{`
        .cyber-tendrils-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
          overflow: visible;
        }

        .tendril-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        /* Streaming Fiber-Optic Pulse Animation */
        @keyframes streamFlow {
          0% {
            stroke-dashoffset: 200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes laserPulseGlow {
          0%, 100% {
            opacity: 0.85;
            filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.9)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.5));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(255, 255, 255, 1)) drop-shadow(0 0 35px rgba(56, 189, 248, 0.85));
          }
        }

        @keyframes sparkTwinkle {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }

        .stream-cyan {
          stroke: #38bdf8;
          filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
          stroke-dasharray: 6 12;
          animation: streamFlow 2.8s linear infinite;
        }

        .stream-green {
          stroke: #22c55e;
          filter: drop-shadow(0 0 6px rgba(34, 197, 94, 0.8));
          stroke-dasharray: 6 12;
          animation: streamFlow 2.5s linear infinite;
        }

        .stream-amber {
          stroke: #f59e0b;
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.8));
          stroke-dasharray: 6 12;
          animation: streamFlow 3s linear infinite;
        }

        .stream-red {
          stroke: #ef4444;
          filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.85));
          stroke-dasharray: 6 12;
          animation: streamFlow 2.4s linear infinite;
        }

        .stream-silver {
          stroke: #cbd5e1;
          filter: drop-shadow(0 0 5px rgba(203, 213, 225, 0.7));
          stroke-dasharray: 5 14;
          animation: streamFlow 3.2s linear infinite;
        }

        .laser-line-main {
          animation: laserPulseGlow 3s ease-in-out infinite;
        }
      `}</style>

      <svg className="tendril-svg" viewBox="0 0 1200 620" preserveAspectRatio="none">
        <defs>
          {/* Gradients for tendril glows */}
          <linearGradient id="gradCyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="gradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="gradAmber" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="gradRed" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="gradSilver" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.5" />
          </linearGradient>

          {/* Horizontal Laser Core Gradient */}
          <linearGradient id="laserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
            <stop offset="10%" stopColor="rgba(56, 189, 248, 0.7)" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#ffffff" />
            <stop offset="90%" stopColor="rgba(56, 189, 248, 0.7)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>

          {/* Glowing particle filter */}
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ─── 1. CYAN TENDRILS (Total Telemetry -> Blue Bars 1 & 2) ─────────── */}
        {/* Soft base glow path */}
        <path d="M 120 100 C 120 150 100 200 90 280" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="4" />
        <path d="M 120 100 C 130 160 150 210 155 350" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="3" />
        {/* Animated streaming dashed pulses */}
        <path d="M 120 100 C 120 150 100 200 90 280" fill="none" className="stream-cyan" strokeWidth="2.5" />
        <path d="M 120 100 C 130 160 150 210 155 350" fill="none" className="stream-cyan" strokeWidth="2" />
        {/* Connection Spark Nodes */}
        <circle cx="90" cy="280" r="3.5" fill="#ffffff" filter="url(#glowFilter)" />
        <circle cx="155" cy="350" r="3" fill="#ffffff" filter="url(#glowFilter)" />

        {/* ─── 2. GREEN TENDRILS (Verified Safe -> Green Bars 3, 4, 9, 10) ───── */}
        <path d="M 360 100 C 340 160 250 210 220 280" fill="none" stroke="rgba(34, 197, 94, 0.25)" strokeWidth="3" />
        <path d="M 360 100 C 370 170 300 210 280 250" fill="none" stroke="rgba(34, 197, 94, 0.25)" strokeWidth="3.5" />
        <path d="M 360 100 C 450 170 650 200 735 250" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="2.5" />
        <path d="M 360 100 C 470 180 720 210 815 270" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="2.5" />
        {/* Animated green streams */}
        <path d="M 360 100 C 340 160 250 210 220 280" fill="none" className="stream-green" strokeWidth="2" />
        <path d="M 360 100 C 370 170 300 210 280 250" fill="none" className="stream-green" strokeWidth="2.5" />
        <path d="M 360 100 C 450 170 650 200 735 250" fill="none" className="stream-green" strokeWidth="1.8" />
        <path d="M 360 100 C 470 180 720 210 815 270" fill="none" className="stream-green" strokeWidth="1.8" />
        {/* Spark Nodes */}
        <circle cx="220" cy="280" r="3.5" fill="#86efac" filter="url(#glowFilter)" />
        <circle cx="280" cy="250" r="3.5" fill="#86efac" filter="url(#glowFilter)" />
        <circle cx="735" cy="250" r="3" fill="#86efac" filter="url(#glowFilter)" />
        <circle cx="815" cy="270" r="3" fill="#86efac" filter="url(#glowFilter)" />

        {/* ─── 3. AMBER TENDRILS (Suspicious -> Orange Bars 5, 11) ───────────── */}
        <path d="M 600 100 C 560 170 400 200 350 260" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="3" />
        <path d="M 600 100 C 640 170 820 200 890 270" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="3" />
        {/* Animated amber streams */}
        <path d="M 600 100 C 560 170 400 200 350 260" fill="none" className="stream-amber" strokeWidth="2.2" />
        <path d="M 600 100 C 640 170 820 200 890 270" fill="none" className="stream-amber" strokeWidth="2.2" />
        {/* Spark Nodes */}
        <circle cx="350" cy="260" r="3.5" fill="#fde68a" filter="url(#glowFilter)" />
        <circle cx="890" cy="270" r="3.5" fill="#fde68a" filter="url(#glowFilter)" />

        {/* ─── 4. RED TENDRILS (Untrusted -> Red Bars 6, 7, 12, 13) ──────────── */}
        <path d="M 840 100 C 780 160 480 200 420 230" fill="none" stroke="rgba(239, 68, 68, 0.22)" strokeWidth="2.5" />
        <path d="M 840 100 C 800 165 520 200 485 230" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="3" />
        <path d="M 840 100 C 880 160 940 200 970 240" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="3" />
        <path d="M 840 100 C 910 170 1000 210 1045 300" fill="none" stroke="rgba(239, 68, 68, 0.25)" strokeWidth="2.5" />
        {/* Animated red streams */}
        <path d="M 840 100 C 780 160 480 200 420 230" fill="none" className="stream-red" strokeWidth="1.8" />
        <path d="M 840 100 C 800 165 520 200 485 230" fill="none" className="stream-red" strokeWidth="2.2" />
        <path d="M 840 100 C 880 160 940 200 970 240" fill="none" className="stream-red" strokeWidth="2.2" />
        <path d="M 840 100 C 910 170 1000 210 1045 300" fill="none" className="stream-red" strokeWidth="1.8" />
        {/* Spark Nodes */}
        <circle cx="420" cy="230" r="3.5" fill="#fca5a5" filter="url(#glowFilter)" />
        <circle cx="485" cy="230" r="3.5" fill="#fca5a5" filter="url(#glowFilter)" />
        <circle cx="970" cy="240" r="3.5" fill="#fca5a5" filter="url(#glowFilter)" />
        <circle cx="1045" cy="300" r="3.5" fill="#fca5a5" filter="url(#glowFilter)" />

        {/* ─── 5. SILVER TENDRILS (Unknown -> Grey Bars 8, 14) ───────────────── */}
        <path d="M 1070 100 C 1000 180 680 220 570 380" fill="none" stroke="rgba(203, 213, 225, 0.2)" strokeWidth="2.5" />
        <path d="M 1070 100 C 1100 180 1120 230 1130 370" fill="none" stroke="rgba(203, 213, 225, 0.25)" strokeWidth="2.5" />
        {/* Animated silver streams */}
        <path d="M 1070 100 C 1000 180 680 220 570 380" fill="none" className="stream-silver" strokeWidth="1.8" />
        <path d="M 1070 100 C 1100 180 1120 230 1130 370" fill="none" className="stream-silver" strokeWidth="1.8" />
        {/* Spark Nodes */}
        <circle cx="570" cy="380" r="3" fill="#ffffff" filter="url(#glowFilter)" />
        <circle cx="1130" cy="370" r="3" fill="#ffffff" filter="url(#glowFilter)" />

        {/* ─── 6. HORIZONTAL GLOWING LASER BASELINE BEAM ──────────────────────── */}
        {/* Wide soft neon blur beam */}
        <line x1="30" y1="365" x2="1170" y2="365" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="12" filter="url(#glowFilter)" />
        {/* Medium intense cyan glow */}
        <line x1="30" y1="365" x2="1170" y2="365" stroke="rgba(56, 189, 248, 0.75)" strokeWidth="4" filter="url(#glowFilter)" />
        {/* Ultra-bright white/cyan laser core */}
        <line x1="30" y1="365" x2="1170" y2="365" stroke="url(#laserGradient)" strokeWidth="2" className="laser-line-main" />
      </svg>
    </div>
  );
};

export default CyberTendrils;
