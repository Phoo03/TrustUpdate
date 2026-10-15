import React from 'react';

const STYLES = {
  VERIFIED: {
    background: 'rgba(22, 101, 52, 0.65)',
    color: '#86efac',
    border: '1px solid rgba(34, 197, 94, 0.5)',
    boxShadow: '0 0 12px rgba(34, 197, 94, 0.25)',
  },
  SUSPICIOUS: {
    background: 'rgba(113, 63, 18, 0.65)',
    color: '#fde047',
    border: '1px solid rgba(234, 179, 8, 0.5)',
    boxShadow: '0 0 12px rgba(234, 179, 8, 0.25)',
  },
  UNTRUSTED: {
    background: 'rgba(127, 29, 29, 0.7)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.6)',
    boxShadow: '0 0 14px rgba(239, 68, 68, 0.3)',
  },
  UNKNOWN: {
    background: 'rgba(30, 41, 59, 0.75)',
    color: '#cbd5e1',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    boxShadow: '0 0 10px rgba(148, 163, 184, 0.15)',
  },
};

/**
 * VerdictBadge — glowing color-coded pill displaying the verification verdict.
 * @param {{ verdict: 'VERIFIED'|'SUSPICIOUS'|'UNTRUSTED'|'UNKNOWN', size?: 'sm'|'md'|'lg' }} props
 */
const VerdictBadge = ({ verdict, size = 'md' }) => {
  const style = STYLES[verdict] || STYLES.UNKNOWN;
  const fontSize = size === 'lg' ? '1.05rem' : size === 'sm' ? '0.72rem' : '0.82rem';
  const padding = size === 'lg' ? '0.5rem 1.25rem' : size === 'sm' ? '0.2rem 0.65rem' : '0.35rem 0.85rem';

  return (
    <span
      style={{
        ...style,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        borderRadius: '9999px',
        fontWeight: 800,
        fontSize,
        padding,
        letterSpacing: '0.06em',
        fontFamily: 'monospace',
        backdropFilter: 'blur(8px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {verdict || 'UNKNOWN'}
    </span>
  );
};

export default VerdictBadge;
