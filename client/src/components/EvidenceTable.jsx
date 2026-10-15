import React from 'react';

const RESULT_COLORS = {
  MATCH: '#22c55e',
  MISMATCH: '#ef4444',
  VALID: '#22c55e',
  INVALID: '#ef4444',
  MISSING: '#f59e0b',
  OK: '#22c55e',
  ROLLBACK_DETECTED: '#ef4444',
  PRIOR_RECORD: '#22c55e',
  NO_PRIOR_RECORD: '#94a3b8',
  NO_REFERENCE: '#94a3b8',
  MATCH_PUBLISHER: '#22c55e',
  UNKNOWN_PUBLISHER: '#f59e0b',
  UNTRUSTED_PUBLISHER: '#ef4444',
  NEWER_THAN_APPROVED: '#f59e0b',
  ERROR: '#ef4444',
};

/**
 * EvidenceTable — renders the ordered evidence array from the Decision Engine.
 * @param {{ evidence: Array<{check, component, result, detail}> }} props
 */
const EvidenceTable = ({ evidence = [] }) => (
  <div style={{ overflowX: 'auto' }}>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.85rem',
        color: '#e2e8f0',
      }}
    >
      <thead>
        <tr style={{ background: '#1e293b', textAlign: 'left' }}>
          {['Check', 'Component', 'Result', 'Detail'].map((h) => (
            <th
              key={h}
              style={{
                padding: '0.6rem 1rem',
                color: '#94a3b8',
                fontWeight: 600,
                borderBottom: '1px solid #334155',
                whiteSpace: 'nowrap',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {evidence.map((row, i) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            style={{ background: i % 2 === 0 ? '#0f172a' : '#1e293b' }}
          >
            <td style={{ padding: '0.6rem 1rem', fontWeight: 500 }}>{row.check}</td>
            <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>{row.component}</td>
            <td style={{ padding: '0.6rem 1rem' }}>
              <span
                style={{
                  color: RESULT_COLORS[row.result] || '#e2e8f0',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {row.result}
              </span>
            </td>
            <td style={{ padding: '0.6rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              {row.detail}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EvidenceTable;
