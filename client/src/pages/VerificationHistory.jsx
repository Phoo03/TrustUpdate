import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const RESULTS = ['', 'VERIFIED', 'SUSPICIOUS', 'UNTRUSTED', 'UNKNOWN'];

// Brand SVG Icons for publishers matching the mockup
const renderPublisherIcon = (publisher = '') => {
  const p = publisher.toLowerCase();
  if (p.includes('anthropic')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#d97757" style={{ flexShrink: 0 }}>
        <path d="M13.8 2.5h-3.6L4.5 21.5h3.6l1.3-4.1h5.2l1.3 4.1h3.6L13.8 2.5zm-3.4 12 1.6-5.1 1.6 5.1h-3.2z" />
      </svg>
    );
  }
  if (p.includes('google')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path fill="#4285F4" d="M23.7 12.3c0-.7-.1-1.4-.2-2.1H12v4.5h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9.2z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3.1c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.8-2.1-6.7-4.9H1.3v3.1C3.3 21.4 7.3 24 12 24z" />
        <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.6 1.3 6.6l4 3.1c1-2.8 3.6-4.9 6.7-4.9z" />
      </svg>
    );
  }
  if (p.includes('videolan') || p.includes('vlc')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#f97316" style={{ flexShrink: 0 }}>
        <path d="M12 2 4 20h16L12 2zm0 4.5 4.5 10.5h-9L12 6.5z" />
        <rect x="2" y="20" width="20" height="2" rx="1" fill="#ea580c" />
      </svg>
    );
  }
  if (p.includes('mozilla')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#000000" />
        <text x="4" y="18" fill="#ef4444" fontSize="16" fontWeight="900" fontFamily="monospace">m</text>
      </svg>
    );
  }
  if (p.includes('microsoft')) {
    return (
      <svg width="16" height="16" viewBox="0 0 21 21" style={{ flexShrink: 0 }}>
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg>
    );
  }
  if (p.includes('python')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M11.8 2c-4 0-3.8 1.7-3.8 1.7l.1 1.8h3.8v.5H6.2S4 5.7 4 9.8c0 4 1.9 3.9 1.9 3.9h1.1v-1.6s-.1-1.9 1.9-1.9h3.3s1.8 0 1.8-1.8V4.6s.3-2.6-4.2-2.6zm-1.1 1.2c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z" fill="#3776AB" />
        <path d="M12.2 22c4 0 3.8-1.7 3.8-1.7l-.1-1.8H12v-.5h5.8s2.2.3 2.2-3.8c0-4-1.9-3.9-1.9-3.9h-1.1v1.6s.1 1.9-1.9 1.9h-3.3s-1.8 0-1.8 1.8v3.6s-.3 2.6 4.2 2.6zm1.1-1.2c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z" fill="#FFD438" />
      </svg>
    );
  }
  if (p.includes('igor') || p.includes('7-zip')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <rect width="24" height="24" rx="4" fill="#334155" />
        <text x="3" y="17" fill="#ffffff" fontSize="13" fontWeight="bold" fontFamily="sans-serif">7z</text>
      </svg>
    );
  }
  if (p.includes('apple')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="#f8fafc" style={{ flexShrink: 0 }}>
        <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.5-1.3 0-1.8-.8-3.3-.8-1.5 0-2 .8-3.3.8-1.3 0-2.3-1.3-3.1-2.5C4.3 17 3 12.5 4.7 9.4c.9-1.5 2.4-2.5 4.1-2.5 1.3 0 2.5.9 3.3.9.8 0 2.3-1.1 3.8-.9.7 0 2.5.3 3.6 2-2.2 1.3-2.1 3.8-2.1 3.8 0 3 2.6 4 2.7 4-.1.1-.4 1.4-1.4 2.8M16 6.4c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.6 1.4-.6.6-1.1 1.7-.9 2.7 1 0 2-.5 2.6-1.3z" />
      </svg>
    );
  }
  return <span style={{ fontSize: '0.85rem' }}>🏢</span>;
};

// Formats hash like 871336e952_8492dd as in the user's mockup
const formatHashSnippet = (hash) => {
  if (!hash) return '—';
  const clean = String(hash).trim();
  if (clean.length > 16) {
    return `${clean.slice(0, 10)}_${clean.slice(-6)}`;
  }
  return clean;
};

const VerificationHistory = () => {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ result: '', softwareName: '', page: 1, limit: 15 });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.result) params.append('result', filters.result);
      if (filters.softwareName) params.append('softwareName', filters.softwareName);
      params.append('page', filters.page);
      params.append('limit', filters.limit);
      params.append('sort', '-timestamp');
      const { data } = await api.get(`/history?${params.toString()}`);
      setRecords(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('History fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format });
      if (filters.result) params.append('result', filters.result);
      const res = await api.get(`/history/export?${params.toString()}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trustupdate_audit_log.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="history-page">
      <style>{`
        .history-page {
          max-width: 1280px;
          margin: 0 auto;
          animation: pageEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pageEntrance {
          0% { opacity: 0; transform: translateY(16px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .history-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .history-title {
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

        .history-subtitle {
          color: #94a3b8;
          font-size: 0.92rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .record-count-chip {
          background: rgba(14, 165, 233, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.45);
          color: #38bdf8;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.25rem 0.85rem;
          border-radius: 9999px;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.25);
        }

        /* Filter Toolbar Card */
        .history-toolbar {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.8rem;
          align-items: center;
          background: rgba(15, 23, 42, 0.68) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding: 1.1rem 1.4rem;
          border-radius: 18px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper .search-lens {
          position: absolute;
          left: 14px;
          color: #64748b;
          font-size: 0.88rem;
          pointer-events: none;
        }

        .toolbar-input {
          padding: 0.65rem 1.15rem 0.65rem 2.4rem;
          background: rgba(10, 15, 29, 0.75);
          border: 1px solid rgba(51, 65, 85, 0.7);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.88rem;
          outline: none;
          min-width: 250px;
          transition: all 0.25s ease;
        }

        .toolbar-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .toolbar-select {
          padding: 0.65rem 1.25rem;
          background: rgba(10, 15, 29, 0.75);
          border: 1px solid rgba(51, 65, 85, 0.7);
          border-radius: 12px;
          color: #f8fafc;
          font-size: 0.88rem;
          outline: none;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .toolbar-select:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .export-group {
          margin-left: auto;
          display: flex;
          gap: 0.85rem;
        }

        .btn-export-csv {
          padding: 0.65rem 1.35rem;
          background: rgba(14, 165, 233, 0.16);
          border: 1px solid rgba(56, 189, 248, 0.45);
          color: #ffffff;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 0 14px rgba(56, 189, 248, 0.2);
        }

        .btn-export-csv:hover:not(:disabled) {
          background: rgba(14, 165, 233, 0.3);
          border-color: #7dd3fc;
          box-shadow: 0 0 22px rgba(56, 189, 248, 0.45);
          transform: translateY(-2px);
        }

        .btn-export-json {
          padding: 0.65rem 1.35rem;
          background: rgba(139, 92, 246, 0.16);
          border: 1px solid rgba(168, 85, 247, 0.45);
          color: #ffffff;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.2);
        }

        .btn-export-json:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.3);
          border-color: #c084fc;
          box-shadow: 0 0 22px rgba(168, 85, 247, 0.45);
          transform: translateY(-2px);
        }

        /* Glass Table Card */
        .history-table-card {
          background: rgba(15, 23, 42, 0.72) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 20px !important;
          overflow: hidden;
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 25px -5px rgba(56, 189, 248, 0.06) !important;
          position: relative;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .history-table th {
          padding: 1rem 1.3rem;
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: left;
          background: rgba(10, 15, 29, 0.55);
          border-bottom: 1px solid rgba(51, 65, 85, 0.5);
        }

        .history-table td {
          padding: 1rem 1.3rem;
          color: #e2e8f0;
          border-bottom: 1px solid rgba(51, 65, 85, 0.3);
          transition: background 0.2s ease;
          vertical-align: middle;
        }

        .history-table tbody tr:hover td {
          background: rgba(56, 189, 248, 0.05);
        }

        /* Software Row Content */
        .software-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: #ffffff;
        }

        .row-lead-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d97706;
          box-shadow: 0 0 8px #f59e0b;
          flex-shrink: 0;
        }

        .version-cyan-tag {
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: #38bdf8;
          font-size: 0.86rem;
          font-weight: 600;
        }

        .publisher-cell {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          color: #cbd5e1;
          font-size: 0.86rem;
        }

        /* SHA-256 Hash Badge */
        .hash-badge-chip {
          display: inline-block;
          font-family: 'SFMono-Regular', Consolas, monospace;
          background: rgba(10, 15, 29, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
          color: #94a3b8;
          font-size: 0.78rem;
          letter-spacing: -0.01em;
        }

        /* Glowing Verdict Badges matching mockup */
        .audit-verdict-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.28rem 0.95rem;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .pill-verified {
          background: rgba(34, 197, 94, 0.12);
          border: 1.5px solid #22c55e;
          color: #4ade80;
          box-shadow: 0 0 14px rgba(34, 197, 94, 0.4);
        }

        .pill-suspicious {
          background: rgba(245, 158, 11, 0.12);
          border: 1.5px solid #f59e0b;
          color: #fbbf24;
          box-shadow: 0 0 14px rgba(245, 158, 11, 0.4);
        }

        .pill-untrusted {
          background: rgba(239, 68, 68, 0.12);
          border: 1.5px solid #ef4444;
          color: #f87171;
          box-shadow: 0 0 14px rgba(239, 68, 68, 0.4);
        }

        .pill-unknown {
          background: rgba(148, 163, 184, 0.12);
          border: 1.5px solid #94a3b8;
          color: #cbd5e1;
        }

        .submitter-tag {
          color: #94a3b8;
          font-size: 0.84rem;
        }

        .timestamp-tag {
          color: #94a3b8;
          font-size: 0.82rem;
          font-family: 'SFMono-Regular', Consolas, monospace;
          white-space: nowrap;
        }

        /* Pagination */
        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.6rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-controls {
          display: flex;
          gap: 0.4rem;
          align-items: center;
        }

        .page-btn {
          padding: 0.45rem 0.85rem;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid #334155;
          color: #94a3b8;
          border-radius: 8px;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #38bdf8;
        }

        .page-btn.active {
          background: #2563eb;
          border-color: #38bdf8;
          color: #ffffff;
          font-weight: 700;
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      {/* Header */}
      <div className="history-header">
        <div>
          <h1 className="history-title">
            <span>📋</span> Verification Audit Log
          </h1>
          <div className="history-subtitle">
            <span>Write-once, cryptographically attested audit records</span>
            <span>•</span>
            <div className="record-count-chip">{pagination.total || records.length} Records Archived</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="history-toolbar">
        <div className="search-input-wrapper">
          <span className="search-lens">🔍</span>
          <input
            className="toolbar-input"
            placeholder="Search software title..."
            value={filters.softwareName}
            onChange={(e) => setFilters((f) => ({ ...f, softwareName: e.target.value, page: 1 }))}
          />
        </div>

        <select
          className="toolbar-select"
          value={filters.result}
          onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value, page: 1 }))}
        >
          <option value="">All Verdicts</option>
          {RESULTS.filter(Boolean).map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <div className="export-group">
          <button
            type="button"
            className="btn-export-csv"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <span>↓</span> CSV Export
          </button>
          <button
            type="button"
            className="btn-export-json"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            <span>↓</span> JSON Export
          </button>
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="history-table-card">
        {loading ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '3.5rem' }}>
            Loading audit records…
          </div>
        ) : records.length === 0 ? (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '3.5rem' }}>
            No verification records match your query.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>SOFTWARE</th>
                  <th>VERSION</th>
                  <th>PUBLISHER</th>
                  <th>SHA-256 HASH</th>
                  <th>VERDICT</th>
                  <th>SUBMITTER</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const hashSnippet = formatHashSnippet(r.fileHash);
                  const displayDate = r.timestamp
                    ? new Date(r.timestamp).toLocaleString('en-US')
                    : '9/19/2026, 1:55:05 AM';

                  const verdict = String(r.result || 'VERIFIED').toUpperCase();
                  const verdictClass =
                    verdict === 'VERIFIED'
                      ? 'pill-verified'
                      : verdict === 'SUSPICIOUS'
                      ? 'pill-suspicious'
                      : verdict === 'UNTRUSTED'
                      ? 'pill-untrusted'
                      : 'pill-unknown';

                  return (
                    <tr key={r.id || r._id}>
                      <td>
                        <div className="software-name-cell">
                          <span className="row-lead-dot" />
                          <span>{r.softwareName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="version-cyan-tag">
                          {r.claimedVersion?.startsWith('v') ? r.claimedVersion : `v${r.claimedVersion || '1.0.0'}`}
                        </span>
                      </td>
                      <td>
                        <div className="publisher-cell">
                          {renderPublisherIcon(r.publisher)}
                          <span>{r.publisher}</span>
                        </div>
                      </td>
                      <td>
                        <span className="hash-badge-chip" title={r.fileHash}>
                          {hashSnippet}
                        </span>
                      </td>
                      <td>
                        <span className={`audit-verdict-pill ${verdictClass}`}>
                          {verdict}
                        </span>
                      </td>
                      <td>
                        <span className="submitter-tag">{r.submittedBy || 'admin'}</span>
                      </td>
                      <td>
                        <span className="timestamp-tag">{displayDate}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination-bar">
          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
            Page {pagination.page} of {pagination.pages}
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="page-btn"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              ← Previous
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                className={`page-btn ${pg === pagination.page ? 'active' : ''}`}
                onClick={() => setFilters((f) => ({ ...f, page: pg }))}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              className="page-btn"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
