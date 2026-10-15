import React from 'react';

/**
 * KpiCard — Futuristic Cybernetic HUD Card matching the user's mockup.
 * Includes holographic PCB circuit traces, radar HUD reticles,
 * neon outer borders, and glowing connector nodes.
 */
const KpiCard = ({ label, value, color = '#38bdf8', icon = '📈', subtitle, type = 'total' }) => {
  // Determine card theme type from label if not explicitly given
  let cardType = type;
  const l = String(label).toLowerCase();
  if (l.includes('total')) cardType = 'total';
  else if (l.includes('verified')) cardType = 'verified';
  else if (l.includes('suspicious')) cardType = 'suspicious';
  else if (l.includes('untrusted') || l.includes('malicious')) cardType = 'untrusted';
  else if (l.includes('unknown') || l.includes('unregistered')) cardType = 'unknown';

  const themeConfigs = {
    total: {
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.45)',
      border: 'rgba(56, 189, 248, 0.55)',
      bgGradient: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.75) 60%)',
    },
    verified: {
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.45)',
      border: 'rgba(34, 197, 94, 0.55)',
      bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(15, 23, 42, 0.75) 60%)',
    },
    suspicious: {
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)',
      border: 'rgba(245, 158, 11, 0.55)',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.75) 60%)',
    },
    untrusted: {
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.45)',
      border: 'rgba(239, 68, 68, 0.55)',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.75) 60%)',
    },
    unknown: {
      color: '#94a3b8',
      glow: 'rgba(148, 163, 184, 0.35)',
      border: 'rgba(148, 163, 184, 0.45)',
      bgGradient: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(15, 23, 42, 0.75) 60%)',
    },
  };

  const currentTheme = themeConfigs[cardType] || themeConfigs.total;

  return (
    <div
      className={`cyber-kpi-card kpi-type-${cardType}`}
      style={{
        '--kpi-neon': currentTheme.color,
        '--kpi-glow': currentTheme.glow,
        '--kpi-border': currentTheme.border,
        '--kpi-bg': currentTheme.bgGradient,
      }}
    >
      <style>{`
        .cyber-kpi-card {
          position: relative;
          background: var(--kpi-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid var(--kpi-border);
          border-radius: 20px;
          padding: 1.4rem 1.6rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          min-width: 200px;
          flex: 1 1 200px;
          box-shadow: 
            0 14px 30px -8px rgba(0, 0, 0, 0.6),
            0 0 20px -3px var(--kpi-glow),
            inset 0 1px 1px rgba(255, 255, 255, 0.2);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          cursor: default;
        }

        .cyber-kpi-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: #ffffff;
          box-shadow: 
            0 22px 45px -10px rgba(0, 0, 0, 0.75),
            0 0 35px 2px var(--kpi-glow),
            inset 0 1px 3px rgba(255, 255, 255, 0.4);
        }

        /* Ambient Circuit Board Overlay */
        .card-circuit-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.35;
          stroke: var(--kpi-neon);
          transition: opacity 0.3s ease;
        }

        .cyber-kpi-card:hover .card-circuit-svg {
          opacity: 0.65;
        }

        /* Corner Tech Brackets */
        .corner-bracket {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: var(--kpi-neon);
          pointer-events: none;
          opacity: 0.6;
        }
        .corner-tl { top: 6px; left: 6px; border-top: 2px solid; border-left: 2px solid; border-radius: 4px 0 0 0; }
        .corner-tr { top: 6px; right: 6px; border-top: 2px solid; border-right: 2px solid; border-radius: 0 4px 0 0; }
        .corner-bl { bottom: 6px; left: 6px; border-bottom: 2px solid; border-left: 2px solid; border-radius: 0 0 0 4px; }
        .corner-br { bottom: 6px; right: 6px; border-bottom: 2px solid; border-right: 2px solid; border-radius: 0 0 4px 0; }

        /* Icon Container */
        .hud-icon-box {
          position: relative;
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 15, 29, 0.85);
          border: 1.5px solid var(--kpi-border);
          box-shadow: 0 0 18px -2px var(--kpi-glow), inset 0 2px 4px rgba(0, 0, 0, 0.5);
          flex-shrink: 0;
          z-index: 2;
        }

        .hud-icon-glyph {
          font-size: 1.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          filter: drop-shadow(0 0 8px var(--kpi-neon));
        }

        /* Radar Target Ring for Total Telemetry */
        .radar-reticle {
          position: absolute;
          inset: -6px;
          border: 1px dashed var(--kpi-neon);
          border-radius: 50%;
          opacity: 0.5;
          animation: spinRadar 12s linear infinite;
        }

        @keyframes spinRadar {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Content */
        .hud-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }

        .hud-value {
          font-size: 2.35rem;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -0.03em;
          text-shadow: 
            0 0 20px var(--kpi-neon),
            0 0 40px var(--kpi-glow),
            0 2px 8px rgba(0,0,0,0.8);
        }

        .hud-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #94a3b8;
          margin-top: 0.35rem;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        }

        /* Bottom Connector Emitter Node */
        .connector-emitter {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 14px;
          height: 6px;
          background: var(--kpi-neon);
          border-radius: 4px;
          box-shadow: 0 0 12px 2px var(--kpi-neon);
          z-index: 3;
        }

        .connector-pulse {
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 14px 4px var(--kpi-neon);
          animation: nodePulse 2s ease-in-out infinite;
        }

        @keyframes nodePulse {
          0%, 100% { transform: translateX(-50%) scale(0.9); opacity: 0.8; }
          50% { transform: translateX(-50%) scale(1.3); opacity: 1; }
        }
        .card-watermark-glyph {
          position: absolute;
          top: 14px;
          right: 18px;
          color: var(--kpi-neon);
          opacity: 0.28;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      {/* Futuristic Corner Tech Brackets */}
      <div className="corner-bracket corner-tl" />
      <div className="corner-bracket corner-tr" />
      <div className="corner-bracket corner-bl" />
      <div className="corner-bracket corner-br" />

      {/* Background Watermark Glyph matching mockup */}
      <div className="card-watermark-glyph" aria-hidden="true">
        {cardType === 'total' && (
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7.5" cy="15.5" r="4.5" />
            <path d="m21 2-9.6 9.6M15.5 7.5l3 3M18.5 4.5l2 2" />
          </svg>
        )}
        {cardType === 'verified' && (
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        )}
        {cardType === 'suspicious' && (
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {cardType === 'untrusted' && (
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        )}
        {cardType === 'unknown' && (
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
      </div>

      {/* Holographic PCB Circuit Traces SVG */}
      <svg className="card-circuit-svg" viewBox="0 0 220 100" fill="none">
        <path d="M 10 15 L 60 15 L 75 30 L 120 30" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="120" cy="30" r="2.5" fill={currentTheme.color} />
        <path d="M 140 10 L 190 10 L 205 25 L 205 70 L 190 85" strokeWidth="1" strokeLinecap="round" />
        <circle cx="140" cy="10" r="2" fill={currentTheme.color} />
        <circle cx="190" cy="85" r="2" fill={currentTheme.color} />
        <path d="M 70 85 L 110 85 L 125 70 L 170 70" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="70" cy="85" r="2" fill={currentTheme.color} />
        {cardType === 'untrusted' && (
          // Electric laser burst lines for untrusted card
          <>
            <line x1="160" y1="40" x2="195" y2="25" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="160" y1="60" x2="200" y2="65" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="2 2" />
          </>
        )}
      </svg>

      {/* Icon with optional radar HUD */}
      <div className="hud-icon-box">
        {cardType === 'total' && <div className="radar-reticle" />}
        <div className="hud-icon-glyph">
          {icon}
        </div>
      </div>

      {/* Label and Big Neon Value */}
      <div className="hud-content">
        <div className="hud-value">{value ?? '0'}</div>
        <div className="hud-label">{label}</div>
        {subtitle && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{subtitle}</div>}
      </div>

      {/* Bottom Glowing Tendril Emitter Point */}
      <div className="connector-emitter" />
      <div className="connector-pulse" />
    </div>
  );
};

export default KpiCard;
