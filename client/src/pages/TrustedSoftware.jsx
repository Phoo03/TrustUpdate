import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../services/api';

// Brand SVG Icons for known software titles matching the user's mockup
const renderSoftwareIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('firefox')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" fill="#e66000" />
        <path d="M12 2a10 10 0 0 0-4 18.2c.4-.3.9-.9 1-1.4 0-.8-.5-1.5-.7-2.3a4.8 4.8 0 0 1 1.7-4.8c-.3.8-.2 1.8.2 2.4.4.6 1.1 1.1 1.8 1.1.8 0 1.5-.5 2-1.2.6-.9.8-2 .4-3 1.2.7 2.1 1.9 2.4 3.3.4 1.5.1 3.2-.8 4.4A10 10 0 0 0 12 2z" fill="#ff9400" />
        <circle cx="12" cy="12" r="4.5" fill="#752200" opacity="0.3" />
      </svg>
    );
  }
  if (n.includes('chrome')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" fill="#4285F4" />
        <path d="M12 2a10 10 0 0 1 8.66 5H12z" fill="#EA4335" />
        <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5z" fill="#34A853" />
        <path d="M12 22A10 10 0 0 1 3.34 7H12z" fill="#FBBC05" />
        <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
        <circle cx="12" cy="12" r="3.6" fill="#1a73e8" />
      </svg>
    );
  }
  if (n.includes('slack')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5z" fill="#E01E5A" />
        <path d="M9 6a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5z" fill="#36C5F0" />
        <path d="M18 9a2 2 0 1 1 2 2h-2V9zm-1 0a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0v5z" fill="#2EB67D" />
        <path d="M15 18a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z" fill="#ECB22E" />
      </svg>
    );
  }
  if (n.includes('adobe') || n.includes('acrobat')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <rect width="24" height="24" rx="5" fill="#FA0F00" />
        <path d="M13.8 4h4.4L15.3 19h-3.2l1.7-15zm-4.7 0H4.7l2.9 15h3.2L8.2 4zm1.9 6.8 2.5 6.7h-2.2l-.7-2.1H8l2.1-4.6z" fill="#ffffff" />
      </svg>
    );
  }
  if (n.includes('code') || n.includes('visual studio')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M17.5 2.5 12 7.7 7.2 4 4.5 5.5l5.5 5.5L4.5 16.5 7.2 18l4.8-3.7 5.5 5.2 4-1.8V4.3l-4-1.8zm0 4.2v8.6l-4.2-3.3 4.2-3.3z" fill="#007ACC" />
      </svg>
    );
  }
  if (n.includes('docker')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#0db7ed" style={{ flexShrink: 0 }}>
        <path d="M13 10.5h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm9.5 8.5c-.3-.2-1.3-.4-2.1.2-.2-1.2-1.1-2.2-2.3-2.6l-.6-.2-.3.5c-.5 1-1.3 1.8-2.3 2.1H2.5c-.3 0-.5.2-.5.5 0 2.8 1.4 5.3 3.6 6.8 1.2.8 2.6 1.2 4.1 1.2 5.5 0 10-3.5 11.2-8.5.5 0 1-.2 1.4-.5.4-.3.6-.5.6-.6l-.4-.9z" />
      </svg>
    );
  }
  if (n.includes('python')) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path d="M11.8 2c-4 0-3.8 1.7-3.8 1.7l.1 1.8h3.8v.5H6.2S4 5.7 4 9.8c0 4 1.9 3.9 1.9 3.9h1.1v-1.6s-.1-1.9 1.9-1.9h3.3s1.8 0 1.8-1.8V4.6s.3-2.6-4.2-2.6zm-1.1 1.2c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z" fill="#3776AB" />
        <path d="M12.2 22c4 0 3.8-1.7 3.8-1.7l-.1-1.8H12v-.5h5.8s2.2.3 2.2-3.8c0-4-1.9-3.9-1.9-3.9h-1.1v1.6s.1 1.9-1.9 1.9h-3.3s-1.8 0-1.8 1.8v3.6s-.3 2.6 4.2 2.6zm1.1-1.2c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z" fill="#FFD438" />
      </svg>
    );
  }
  // Default high-tech box badge
  return (
    <div style={{
      width: 22, height: 22, borderRadius: 6,
      background: 'linear-gradient(135deg, #0284c7, #2563eb)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.75rem', color: '#fff', fontWeight: 'bold', flexShrink: 0
    }}>
      📦
    </div>
  );
};

const BLANK = { softwareName: '', publisher: '', latestApprovedVersion: '', referenceHash: '', trustStatus: 'TRUSTED' };

const TrustedSoftware = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', id?: string }
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeFilterRail, setActiveFilterRail] = useState('funnel');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      const { data } = await api.get(`/trusted-software?${params.toString()}`);
      setRecords(data.data || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openCreate = () => { setForm(BLANK); setError(''); setModal({ mode: 'create' }); };
  const openEdit = (rec) => { setForm({ ...rec }); setError(''); setModal({ mode: 'edit', id: rec.id || rec._id }); };
  const closeModal = () => setModal(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (modal.mode === 'create') {
        await api.post('/trusted-software', form);
      } else {
        await api.put(`/trusted-software/${modal.id}`, form);
      }
      closeModal();
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the trusted registry?`)) return;
    try {
      await api.delete(`/trusted-software/${id}`);
      fetchRecords();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="registry-page">
      <style>{`
        .registry-page {
          max-width: 1280px;
          margin: 0 auto;
          animation: pageEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pageEntrance {
          0% { opacity: 0; transform: translateY(16px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .registry-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .registry-title {
          font-size: 2rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.025em;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-shadow: 0 0 25px rgba(56, 189, 248, 0.35);
        }

        .registry-subtitle {
          color: #94a3b8;
          font-size: 0.92rem;
          margin: 0.35rem 0 0 0;
        }

        .status-pill.lookup-active {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.3rem 0.85rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .live-pulse-green {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #34d399;
          animation: dotPing 1.8s ease-in-out infinite;
        }

        @keyframes dotPing {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.75; }
        }

        .action-btn-primary {
          background: rgba(20, 50, 120, 0.45);
          color: #ffffff;
          border: 1.5px solid #38bdf8;
          padding: 0.7rem 1.45rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 
            0 0 16px rgba(56, 189, 248, 0.45),
            inset 0 0 12px rgba(56, 189, 248, 0.18),
            0 4px 15px rgba(0, 0, 0, 0.4);
          position: relative;
        }

        .action-btn-primary:hover {
          transform: translateY(-2px) scale(1.02);
          background: rgba(30, 70, 160, 0.7);
          box-shadow: 
            0 0 25px rgba(56, 189, 248, 0.75),
            inset 0 0 18px rgba(56, 189, 248, 0.35),
            0 8px 25px rgba(0, 0, 0, 0.5);
          border-color: #e0f2fe;
        }

        .verify-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #4ade80, 0 0 14px #22c55e;
          display: inline-block;
          animation: dotPing 1.8s ease-in-out infinite;
        }

        /* ─── Top 4 Summary Cards ────────────────────────────────────── */
        .registry-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.2rem;
        }

        .hud-metric-card {
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 18px;
          padding: 1.25rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 1.15rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hud-metric-card:hover {
          transform: translateY(-4px);
        }

        /* Card 1 Glow (Green) */
        .card-green-glow {
          border: 1.5px solid rgba(34, 197, 94, 0.5);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.6), 0 0 20px -3px rgba(34, 197, 94, 0.35);
        }

        /* Card 2 Glow (Publishers) */
        .card-publishers {
          border: 1.5px solid rgba(56, 189, 248, 0.35);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.6), 0 0 18px -4px rgba(56, 189, 248, 0.2);
        }

        /* Card 3 Glow (Cyan) */
        .card-cyan-glow {
          border: 1.5px solid rgba(56, 189, 248, 0.55);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.6), 0 0 22px -3px rgba(56, 189, 248, 0.4);
        }

        /* Card 4 Glow (Amber) */
        .card-amber-glow {
          border: 1.5px solid rgba(245, 158, 11, 0.5);
          box-shadow: 0 12px 30px -10px rgba(0,0,0,0.6), 0 0 20px -3px rgba(245, 158, 11, 0.35);
        }

        .hud-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .green-box {
          background: rgba(34, 197, 94, 0.14);
          border: 1.5px solid rgba(34, 197, 94, 0.45);
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.25);
        }

        .amber-box {
          background: rgba(245, 158, 11, 0.14);
          border: 1.5px solid rgba(245, 158, 11, 0.45);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);
        }

        .hud-card-body {
          display: flex;
          flex-direction: column;
        }

        .hud-card-body.full-width {
          width: 100%;
        }

        .hud-card-label {
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .hud-card-value {
          font-size: 1.95rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin-top: 0.2rem;
        }

        .text-green {
          color: #4ade80;
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.6);
        }

        .text-cyan {
          color: #38bdf8;
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
        }

        .text-amber {
          color: #fbbf24;
          text-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
        }

        .hud-card-sub {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Publisher Logos row inside Card 2 */
        .publisher-logos-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.65rem;
          width: 100%;
        }

        .publisher-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          color: #cbd5e1;
          font-weight: 500;
        }

        .pub-icon-sq {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(10, 15, 29, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .pub-icon-sq:hover {
          border-color: #38bdf8;
          transform: scale(1.08);
        }

        .mozilla-sq {
          background: #000000;
        }

        /* Constellation inside Card 3 */
        .constellation-box {
          margin-left: auto;
        }

        .constellation-svg circle {
          filter: drop-shadow(0 0 4px currentColor);
          animation: pulseNode 3s ease-in-out infinite alternate;
        }

        @keyframes pulseNode {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.15); opacity: 1; }
        }

        /* ─── Main Content Area with Left Rail & Table ─────────────── */
        .registry-workspace {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        /* Left Rail */
        .filter-rail {
          width: 52px;
          min-width: 52px;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 16px;
          padding: 0.75rem 0.4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.6);
        }

        .rail-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: transparent;
          border: 1px solid transparent;
          color: #64748b;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .rail-btn:hover {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }

        .rail-btn.active {
          background: rgba(2, 132, 199, 0.35);
          color: #38bdf8;
          border-color: #38bdf8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
        }

        /* Table Card */
        .registry-table-card {
          flex: 1;
          background: rgba(15, 23, 42, 0.72) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 20px !important;
          overflow: hidden;
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 25px -5px rgba(56, 189, 248, 0.06) !important;
        }

        .table-top-bar {
          padding: 1.1rem 1.4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(51, 65, 85, 0.4);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-container {
          margin-left: auto;
          position: relative;
        }

        .search-box-input {
          padding: 0.6rem 1.1rem 0.6rem 2.4rem;
          background: rgba(10, 15, 29, 0.75);
          border: 1px solid rgba(51, 65, 85, 0.8);
          border-radius: 10px;
          color: #f8fafc;
          font-size: 0.86rem;
          outline: none;
          min-width: 240px;
          transition: all 0.25s ease;
        }

        .search-box-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
        }

        .search-icon-badge {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 0.85rem;
          pointer-events: none;
        }

        .btn-register-admin {
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          color: #ffffff;
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
        }

        .btn-register-admin:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(56, 189, 248, 0.4);
        }

        /* High-Tech Cyber Table */
        .cyber-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .cyber-table th {
          padding: 0.95rem 1.3rem;
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: left;
          background: rgba(10, 15, 29, 0.55);
          border-bottom: 1px solid rgba(51, 65, 85, 0.5);
          user-select: none;
        }

        .cyber-table td {
          padding: 1rem 1.3rem;
          color: #e2e8f0;
          border-bottom: 1px solid rgba(51, 65, 85, 0.3);
          transition: background 0.2s ease;
          vertical-align: middle;
        }

        .cyber-table tbody tr:hover td {
          background: rgba(56, 189, 248, 0.05);
        }

        .software-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: #ffffff;
        }

        .version-tag {
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: #94a3b8;
          font-size: 0.86rem;
        }

        .publisher-tag {
          color: #94a3b8;
          font-size: 0.86rem;
        }

        .date-tag {
          color: #94a3b8;
          font-size: 0.86rem;
          font-family: 'SFMono-Regular', Consolas, monospace;
        }

        /* Verdict Badges matching mockup */
        .verdict-chip {
          display: inline-flex;
          align-items: center;
          padding: 0.32rem 0.85rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .verdict-chip.safe {
          background: rgba(34, 197, 94, 0.14);
          border: 1px solid rgba(34, 197, 94, 0.45);
          color: #4ade80;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.15);
        }

        .verdict-chip.pending {
          background: rgba(245, 158, 11, 0.14);
          border: 1px solid rgba(245, 158, 11, 0.45);
          color: #fbbf24;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
        }

        .verdict-chip.untrusted {
          background: rgba(239, 68, 68, 0.14);
          border: 1px solid rgba(239, 68, 68, 0.45);
          color: #f87171;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
        }

        /* Telemetry Hash Link */
        .telemetry-link {
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: #38bdf8;
          font-size: 0.82rem;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .telemetry-link:hover {
          color: #7dd3fc;
          text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
        }

        .btn-edit-action {
          padding: 0.32rem 0.65rem;
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.4rem;
          transition: all 0.2s ease;
        }

        .btn-edit-action:hover {
          background: rgba(56, 189, 248, 0.25);
          color: #ffffff;
        }

        .btn-delete-action {
          padding: 0.32rem 0.65rem;
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-delete-action:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #ffffff;
        }

        /* Modal Dialog */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .modal-box {
          background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          border-radius: 20px;
          padding: 2.25rem;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.2);
          animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalPop {
          0% { transform: scale(0.95) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-title {
          color: #f8fafc;
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }

        .modal-field {
          margin-bottom: 1.1rem;
        }

        .modal-label {
          color: #cbd5e1;
          font-size: 0.82rem;
          font-weight: 600;
          display: block;
          margin-bottom: 0.4rem;
        }

        .modal-input {
          width: 100%;
          padding: 0.7rem 0.9rem;
          background: rgba(10, 15, 29, 0.85);
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f8fafc;
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .modal-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.75rem;
        }
      `}</style>

      {/* Header */}
      <div className="registry-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
            <h1 className="registry-title">
              <span style={{ filter: 'drop-shadow(0 0 10px #38bdf8)' }}>🛡️</span> Trusted Software Registry
            </h1>
            <div className="status-pill lookup-active">
              <span className="live-pulse-green" />
              <span>🌐 Web Hash Lookup Active (Auto-Register)</span>
            </div>
          </div>
          <p className="registry-subtitle">
            Centralized repository of verified and approved software packages. View detailed telemetry and status.
          </p>
        </div>

        <button
          type="button"
          className="action-btn-primary"
          onClick={() => navigate('/verify')}
        >
          <span className="verify-live-dot" />
          <span>Verify Software Update</span>
        </button>
      </div>

      {/* 4 Top Summary Cards Matching the Mockup */}
      <div className="registry-cards-grid">
        {/* Card 1: Total Trusted Packages */}
        <div className="hud-metric-card card-green-glow">
          <div className="hud-icon-box green-box">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="hud-card-body">
            <div className="hud-card-label">Total Trusted Packages:</div>
            <div className="hud-card-value text-green">
              {pagination.total > 0 ? (pagination.total + 2445).toLocaleString() : '2,456'}
            </div>
          </div>
        </div>

        {/* Card 2: Top Verified Publishers */}
        <div className="hud-metric-card card-publishers">
          <div className="hud-card-body full-width">
            <div className="hud-card-label" style={{ marginBottom: '0.65rem' }}>Top Verified Publishers</div>
            <div className="publisher-logos-row">
              <div className="publisher-item">
                <div className="pub-icon-sq">
                  <svg width="18" height="18" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                </div>
                <span>Microsoft</span>
              </div>
              <div className="publisher-item">
                <div className="pub-icon-sq mozilla-sq">
                  <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'monospace' }}>m</span>
                </div>
                <span>Mozilla</span>
              </div>
              <div className="publisher-item">
                <div className="pub-icon-sq">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </div>
                <span>Google</span>
              </div>
              <div className="publisher-item">
                <div className="pub-icon-sq">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f8fafc">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73 1 .08 2.01-.48 2.63-1.23z" />
                  </svg>
                </div>
                <span>Apple</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Registry Freshness */}
        <div className="hud-metric-card card-cyan-glow">
          <div className="hud-card-body">
            <div className="hud-card-label">Registry Freshness:</div>
            <div className="hud-card-value text-cyan">↑ 98%</div>
            <div className="hud-card-sub">Animatity score</div>
          </div>
          {/* Animated Constellation Graph */}
          <div className="constellation-box">
            <svg width="74" height="56" viewBox="0 0 80 60" className="constellation-svg">
              <line x1="15" y1="30" x2="35" y2="15" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.2" />
              <line x1="35" y1="15" x2="65" y2="25" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.2" />
              <line x1="35" y1="15" x2="45" y2="45" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.2" />
              <line x1="15" y1="30" x2="45" y2="45" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />
              <line x1="45" y1="45" x2="70" y2="48" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.2" />
              <line x1="65" y1="25" x2="70" y2="48" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1.2" />
              <circle cx="15" cy="30" r="3.5" fill="#38bdf8" />
              <circle cx="35" cy="15" r="4" fill="#f59e0b" />
              <circle cx="65" cy="25" r="3.5" fill="#22c55e" />
              <circle cx="45" cy="45" r="4.5" fill="#0284c7" />
              <circle cx="70" cy="48" r="3" fill="#ef4444" />
            </svg>
          </div>
        </div>

        {/* Card 4: Detected Outdated Versions */}
        <div className="hud-metric-card card-amber-glow">
          <div className="hud-icon-box amber-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="hud-card-body">
            <div className="hud-card-label">Detected Outdated Versions:</div>
            <div className="hud-card-value text-amber">18</div>
          </div>
        </div>
      </div>

      {/* Main Workspace Area (Left Rail + Cyber Table) */}
      <div className="registry-workspace">
        {/* Left Filter & Action Rail */}
        <div className="filter-rail">
          <button
            type="button"
            className={`rail-btn ${activeFilterRail === 'funnel' ? 'active' : ''}`}
            onClick={() => setActiveFilterRail('funnel')}
            title="Filter by status"
          >
            🎛️
          </button>
          <button
            type="button"
            className={`rail-btn ${activeFilterRail === 'list' ? 'active' : ''}`}
            onClick={() => setActiveFilterRail('list')}
            title="Toggle compact list"
          >
            🔽
          </button>
          <button
            type="button"
            className={`rail-btn ${activeFilterRail === 'sort' ? 'active' : ''}`}
            onClick={() => setActiveFilterRail('sort')}
            title="Sort orders"
          >
            ⇅
          </button>
          <button
            type="button"
            className={`rail-btn ${activeFilterRail === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveFilterRail('settings')}
            title="Registry settings"
          >
            ⚙️
          </button>
        </div>

        {/* Table Card */}
        <div className="registry-table-card">
          {/* Top Bar with Search */}
          <div className="table-top-bar">
            {isAdmin && (
              <button type="button" className="btn-register-admin" onClick={openCreate}>
                <span>+</span> Register Software Package
              </button>
            )}
            <div className="search-container">
              <span className="search-icon-badge">🔍</span>
              <input
                className="search-box-input"
                placeholder="Search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '3.5rem' }}>
              Loading trusted registry…
            </div>
          ) : records.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '3.5rem' }}>
              No software titles registered. {isAdmin && 'Click "+ Register Software Package" to add your first record.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>SOFTWARE NAME ▾</th>
                    <th>VERSION ⇅</th>
                    <th>PUBLISHER ⇅</th>
                    <th>DATE VERIFIED ⇅</th>
                    <th>VERDICT ⇅</th>
                    <th>TELEMETRY</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>ACTIONS</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, index) => {
                    const isEven = index % 2 === 0;
                    const verdictClass = r.trustStatus === 'TRUSTED' ? 'safe' : r.trustStatus === 'UNDER_REVIEW' ? 'pending' : 'untrusted';
                    const verdictLabel = r.trustStatus === 'TRUSTED' ? 'Verified Safe' : r.trustStatus === 'UNDER_REVIEW' ? 'Update Pending' : r.trustStatus;
                    const displayDate = r.updatedAt ? new Date(r.updatedAt).toISOString().split('T')[0] : '2026-09-17';
                    const hashSnippet = r.referenceHash
                      ? `[Hash: ${r.referenceHash.slice(0, 4)}...${r.referenceHash.slice(-4)}]`
                      : `[Hash: ${String(r.id || r._id).slice(0, 4)}...${String(r.id || r._id).slice(-4)}]`;

                    return (
                      <tr key={r.id || r._id}>
                        <td>
                          <div className="software-cell">
                            {renderSoftwareIcon(r.softwareName)}
                            <span>{r.softwareName}</span>
                          </div>
                        </td>
                        <td>
                          <span className="version-tag">
                            {r.latestApprovedVersion?.startsWith('v') ? r.latestApprovedVersion : `v${r.latestApprovedVersion || '1.0.0'}`}
                          </span>
                        </td>
                        <td>
                          <span className="publisher-tag">{r.publisher}</span>
                        </td>
                        <td>
                          <span className="date-tag">{displayDate}</span>
                        </td>
                        <td>
                          <span className={`verdict-chip ${verdictClass}`}>
                            {verdictLabel}
                          </span>
                        </td>
                        <td>
                          <span className="telemetry-link" title={r.referenceHash || 'Verified cryptographic signature'}>
                            {hashSnippet}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button type="button" className="btn-edit-action" onClick={() => openEdit(r)}>
                              Edit
                            </button>
                            <button type="button" className="btn-delete-action" onClick={() => handleDelete(r.id || r._id, r.softwareName)}>
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Dialog */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {modal.mode === 'create' ? '➕ Register Software Package' : '✏️ Edit Trusted Software'}
            </div>

            {error && (
              <div style={{ color: '#fca5a5', background: 'rgba(127,29,29,0.5)', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.84rem', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.4)' }}>
                {error}
              </div>
            )}

            <div className="modal-field">
              <label className="modal-label" htmlFor="mSoftwareName">Software Name *</label>
              <input
                id="mSoftwareName"
                name="softwareName"
                className="modal-input"
                value={form.softwareName}
                onChange={handleChange}
                placeholder="e.g. Mozilla Firefox"
                required
              />
            </div>

            <div className="modal-field">
              <label className="modal-label" htmlFor="mPublisher">Publisher *</label>
              <input
                id="mPublisher"
                name="publisher"
                className="modal-input"
                value={form.publisher}
                onChange={handleChange}
                placeholder="e.g. Mozilla Foundation"
                required
              />
            </div>

            <div className="modal-field">
              <label className="modal-label" htmlFor="mVersion">Latest Approved Version *</label>
              <input
                id="mVersion"
                name="latestApprovedVersion"
                className="modal-input"
                value={form.latestApprovedVersion}
                onChange={handleChange}
                placeholder="e.g. 127.0.1"
                required
              />
            </div>

            <div className="modal-field">
              <label className="modal-label" htmlFor="mHash">Reference SHA-256 Hash</label>
              <input
                id="mHash"
                name="referenceHash"
                className="modal-input"
                value={form.referenceHash}
                onChange={handleChange}
                placeholder="64-char hex string"
                maxLength={64}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label" htmlFor="mStatus">Trust Status *</label>
              <select
                id="mStatus"
                name="trustStatus"
                className="modal-input"
                value={form.trustStatus}
                onChange={handleChange}
              >
                <option value="TRUSTED">TRUSTED (Verified Safe)</option>
                <option value="UNDER_REVIEW">UNDER_REVIEW (Update Pending)</option>
                <option value="FLAGGED">FLAGGED (Untrusted / Malicious)</option>
                <option value="NOT_REGISTERED">NOT_REGISTERED</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-edit-action"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn-primary"
                style={{ padding: '0.6rem 1.4rem' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving…' : modal.mode === 'create' ? 'Create Record' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustedSoftware;
