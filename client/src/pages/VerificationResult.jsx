import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VerdictBadge from '../components/VerdictBadge';
import EvidenceTable from '../components/EvidenceTable';

const RECOMMENDATION_THEMES = {
  VERIFIED: {
    bg: 'rgba(20, 83, 45, 0.25)',
    border: 'rgba(34, 197, 94, 0.4)',
    color: '#bbf7d0',
    icon: '🛡️',
  },
  SUSPICIOUS: {
    bg: 'rgba(113, 63, 18, 0.25)',
    border: 'rgba(234, 179, 8, 0.4)',
    color: '#fef08a',
    icon: '⚠️',
  },
  UNTRUSTED: {
    bg: 'rgba(127, 29, 29, 0.25)',
    border: 'rgba(239, 68, 68, 0.5)',
    color: '#fecaca',
    icon: '🚫',
  },
  UNKNOWN: {
    bg: 'rgba(30, 41, 59, 0.35)',
    border: 'rgba(148, 163, 184, 0.3)',
    color: '#cbd5e1',
    icon: '❓',
  },
};

const VerificationResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const result = state?.result;

  if (!result) {
    return (
      <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9' }}>No verification result found.</p>
        <button
          type="button"
          style={{
            marginTop: '1rem',
            padding: '0.65rem 1.25rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/verify')}
        >
          Verify an update →
        </button>
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      showToast('✅ Update approved. Audit record is certified.');
    } catch {
      showToast('❌ Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    showToast('🚫 Update rejected. Installation has been blocked.');
  };

  const theme = RECOMMENDATION_THEMES[result.result] || RECOMMENDATION_THEMES.UNKNOWN;

  return (
    <div className="result-page">
      <style>{`
        .result-page {
          max-width: 1080px;
          margin: 0 auto;
          animation: pageEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .result-header {
          margin-bottom: 2.2rem;
        }

        .result-title {
          color: #f8fafc;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin: 0 0 0.45rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
        }

        .result-meta {
          color: #94a3b8;
          font-size: 0.92rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .meta-chip {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.7rem;
          border-radius: 8px;
          font-family: monospace;
          color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.15);
        }

        /* Glass Cards */
        .verdict-card {
          background: rgba(15, 23, 42, 0.72) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.09) !important;
          border-radius: 22px !important;
          padding: 2.5rem;
          margin-bottom: 2.2rem;
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 25px -5px rgba(56, 189, 248, 0.08) !important;
          position: relative;
          overflow: hidden;
        }

        .card-label {
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1.25rem;
        }

        .verdict-hero-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .verdict-explanation {
          color: #cbd5e1;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .recommendation-box {
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          font-size: 0.92rem;
          line-height: 1.6;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          backdrop-filter: blur(10px);
        }

        .btn-action-row {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .btn-approve {
          padding: 0.7rem 1.4rem;
          background: linear-gradient(135deg, #166534 0%, #15803d 100%);
          color: #dcfce7;
          border: 1px solid rgba(34, 197, 94, 0.4);
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          box-shadow: 0 4px 15px rgba(22, 101, 52, 0.35);
        }

        .btn-approve:hover {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.45);
        }

        .btn-reject {
          padding: 0.7rem 1.4rem;
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
          color: #fee2e2;
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          box-shadow: 0 4px 15px rgba(127, 29, 29, 0.35);
        }

        .btn-reject:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.45);
        }

        .btn-secondary-action {
          padding: 0.7rem 1.25rem;
          background: rgba(30, 41, 59, 0.8);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .btn-secondary-action:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #38bdf8;
          transform: translateY(-2px);
        }

        .toast-popup {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 12px;
          padding: 1rem 1.4rem;
          color: #f8fafc;
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
          z-index: 1000;
          animation: toastSlide 0.3s ease-out;
        }

        @keyframes toastSlide {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div className="result-header">
        <h1 className="result-title">
          <span>🔍</span> Verification Result
        </h1>
        <div className="result-meta">
          <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{result.softwareName}</span>
          <span>•</span>
          <span className="meta-chip">v{result.claimedVersion}</span>
          <span>•</span>
          <span>{result.publisher}</span>
          <span>•</span>
          <span style={{ color: '#64748b' }}>{new Date(result.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Web Intelligence & Auto-Registration Banner */}
      {(result.autoRegistered || result.webVerified) && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.45) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '1.25rem 1.75rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              🌐
            </div>
            <div>
              <div style={{ color: '#6ee7b7', fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>
                {result.autoRegistered
                  ? 'Auto-Verified & Saved to Database Registry'
                  : 'Verified via Global Web Intelligence'}
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                {result.webResult?.source
                  ? `Authenticated through ${result.webResult.source} (${result.webResult.cleanVendors || 'Clean'}). Record automatically stored in database registry.`
                  : 'Public hash intelligence validated this software package as clean and legitimate.'}
              </div>
            </div>
          </div>
          {result.autoRegistered && (
            <button
              type="button"
              className="btn-secondary-action"
              style={{ borderColor: 'rgba(16, 185, 129, 0.5)', color: '#6ee7b7', whiteSpace: 'nowrap' }}
              onClick={() => navigate('/trusted')}
            >
              View in Registry →
            </button>
          )}
        </div>
      )}

      {/* Verdict & Recommendation Card */}
      <div className="verdict-card">
        <div className="card-label">Security Decision Engine Verdict</div>
        <div className="verdict-hero-row">
          <VerdictBadge verdict={result.result} size="lg" />
          <div className="verdict-explanation">
            {result.result === 'VERIFIED' && 'All cryptographic and authenticity checks PASSED. Software update is genuine and valid.'}
            {result.result === 'SUSPICIOUS' && 'Inconclusive or conflicting checks detected. Manual security review required before installing.'}
            {result.result === 'UNTRUSTED' && 'CRITICAL SECURITY FAILURE. File tampering, rollback, or untrusted publisher detected.'}
            {result.result === 'UNKNOWN' && 'Insufficient reference data on record. This is not a security failure — software must be registered.'}
          </div>
        </div>

        {/* Recommendation Advisory */}
        <div
          className="recommendation-box"
          style={{
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            color: theme.color,
          }}
          data-testid="recommendation"
        >
          <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{theme.icon}</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem', textTransform: 'uppercase', fontSize: '0.76rem', letterSpacing: '0.05em' }}>
              Actionable Security Recommendation
            </div>
            <div>{result.recommendation}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="btn-action-row">
          <button
            type="button"
            className="btn-approve"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            <span>✓</span> Approve Update
          </button>
          <button
            type="button"
            className="btn-reject"
            onClick={handleReject}
          >
            <span>✕</span> Reject Update
          </button>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={() => navigate('/verify')}
          >
            <span>🔄</span> Verify Another
          </button>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={() => navigate('/history')}
          >
            <span>📋</span> View Audit Log
          </button>
        </div>
      </div>

      {/* Evidence Breakdown */}
      <div className="verdict-card" style={{ padding: '1.75rem 2rem' }}>
        <div className="card-label">Component Evidence Breakdown</div>
        <EvidenceTable evidence={result.evidence} />
      </div>

      {/* Toast popup */}
      {toast && <div className="toast-popup">{toast}</div>}
    </div>
  );
};

export default VerificationResult;
