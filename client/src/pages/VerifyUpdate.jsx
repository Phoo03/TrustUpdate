import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STEPS = [
  { num: '1', title: 'Upload File', desc: 'Drag-and-drop or select the software update file.' },
  { num: '2', title: 'Integrity Check', desc: 'SHA-256 hash computed and compared to the trusted registry.' },
  { num: '3', title: 'Authenticity Check', desc: 'Signature, publisher identity, and version freshness verified.' },
  { num: '4', title: 'Trust Verdict', desc: 'Explainable result returned: VERIFIED, SUSPICIOUS, UNTRUSTED, or UNKNOWN.' },
];

const PRESETS = [
  {
    label: '🔴 Tampered File (UNTRUSTED)',
    data: {
      softwareName: 'Mozilla Firefox',
      claimedVersion: '127.0.1',
      publisher: 'Mozilla Foundation',
      referenceHash: '0000000000000000000000000000000000000000000000000000000000000000',
    },
  },
  {
    label: '🔴 Rollback Attack (UNTRUSTED)',
    data: {
      softwareName: 'Visual Studio Code',
      claimedVersion: '1.85.0',
      publisher: 'Microsoft Corporation',
      referenceHash: '',
    },
  },
  {
    label: '⚪ Unregistered Software (UNKNOWN)',
    data: {
      softwareName: 'NewCustomTool',
      claimedVersion: '1.0.0',
      publisher: 'UnknownTeam',
      referenceHash: '',
    },
  },
  {
    label: '🟡 Newer Version (SUSPICIOUS)',
    data: {
      softwareName: 'Ubuntu Desktop',
      claimedVersion: '25.04',
      publisher: 'Canonical Ltd.',
      referenceHash: '',
    },
  },
];

const VerifyUpdate = () => {
  const navigate = useNavigate();
  const fileRef = useRef();
  const sigRef = useRef();
  const [form, setForm] = useState({ softwareName: '', claimedVersion: '', publisher: '', referenceHash: '' });
  const [file, setFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const applyPreset = (presetData) => {
    setForm(presetData);
    setError('');
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file to verify.'); return; }
    if (file.size === 0) { setError('The selected file is empty (0 bytes). Please upload a valid software package.'); return; }
    if (file.size > 500 * 1024 * 1024) { setError('File size exceeds the 500 MB maximum limit.'); return; }
    if (form.claimedVersion && !/^\d+(\.\d+)+(-[a-zA-Z0-9.]+)?$/.test(form.claimedVersion.trim())) {
      setError('Version format is invalid. Please use semantic format (e.g. 1.0.0 or 127.0.1).');
      return;
    }
    if (form.referenceHash && !/^[a-fA-F0-9]{64}$/.test(form.referenceHash.trim())) {
      setError('Reference hash must be exactly 64 hexadecimal characters (SHA-256).');
      return;
    }

    setError('');
    setLoading(true);
    setProgress('Uploading and computing streaming SHA-256 hash…');

    const fd = new FormData();
    fd.append('file', file);
    if (sigFile) fd.append('signature', sigFile);
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });

    try {
      setProgress('Running cryptographic authenticity, version freshness, and registry audit checks…');
      const { data } = await api.post('/verify', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="verify-page">
      <style>{`
        .verify-page {
          max-width: 1080px;
          margin: 0 auto;
          animation: pageEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .verify-header {
          margin-bottom: 2.2rem;
        }

        .verify-title {
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

        .verify-subtitle {
          color: #94a3b8;
          font-size: 0.92rem;
          margin: 0;
        }

        /* 4-Step Pipeline */
        .pipeline-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 1.15rem;
          margin-bottom: 2.2rem;
        }

        .pipeline-card {
          background: rgba(15, 23, 42, 0.68);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 1.35rem 1.25rem;
          position: relative;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        }

        .pipeline-card:hover {
          background: rgba(22, 32, 54, 0.85);
          transform: translateY(-4px);
          border-color: rgba(56, 189, 248, 0.4);
          box-shadow: 0 18px 35px -8px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2);
        }

        .step-number-badge {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.85rem;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.25);
        }

        .step-title-text {
          color: #f1f5f9;
          font-size: 0.92rem;
          font-weight: 700;
          margin: 0 0 0.35rem 0;
        }

        .step-desc-text {
          color: #94a3b8;
          font-size: 0.78rem;
          line-height: 1.5;
          margin: 0;
        }

        /* Glass Form Cards */
        .glass-card {
          background: rgba(15, 23, 42, 0.7) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border: 1px solid rgba(255, 255, 255, 0.09) !important;
          border-radius: 22px !important;
          padding: 2.2rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 25px -5px rgba(56, 189, 248, 0.08) !important;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-card:hover {
          border-color: rgba(56, 189, 248, 0.25) !important;
        }

        .card-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .card-heading {
          color: #38bdf8;
          font-size: 0.76rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .preset-strip {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .preset-btn {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(56, 189, 248, 0.2);
          color: #94a3b8;
          font-size: 0.74rem;
          padding: 0.3rem 0.65rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .preset-btn:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #38bdf8;
          transform: translateY(-1px);
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 680px) {
          .form-grid-2 {
            grid-template-columns: 1fr;
          }
        }

        .field-group {
          display: flex;
          flex-direction: column;
        }

        .field-label {
          color: #cbd5e1;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 0.45rem;
        }

        .field-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f8fafc;
          font-size: 0.9rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s ease;
        }

        .field-input:focus {
          border-color: #38bdf8;
          background: rgba(15, 23, 42, 0.98);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.22);
        }

        /* Dropzone */
        .dropzone-box {
          border: 2px dashed rgba(56, 189, 248, 0.25);
          border-radius: 16px;
          padding: 2.75rem 1.5rem;
          text-align: center;
          cursor: pointer;
          color: #94a3b8;
          background: rgba(15, 23, 42, 0.45);
          transition: all 0.3s ease;
          position: relative;
        }

        .dropzone-box:hover, .dropzone-box.active {
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.06);
          box-shadow: 0 0 25px rgba(56, 189, 248, 0.15);
          transform: translateY(-2px);
        }

        .upload-icon-pulse {
          font-size: 2.8rem;
          margin-bottom: 0.65rem;
          display: inline-block;
          animation: pulseIcon 3s infinite ease-in-out;
        }

        @keyframes pulseIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .selected-file-chip {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #38bdf8;
          padding: 0.4rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-family: monospace;
        }

        .submit-verify-btn {
          width: 100%;
          padding: 0.95rem;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: #ffffff;
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
        }

        .submit-verify-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(56, 189, 248, 0.45);
        }

        .submit-verify-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .error-banner {
          background: rgba(127, 29, 29, 0.65);
          color: #fecaca;
          border: 1px solid rgba(220, 38, 38, 0.6);
          border-radius: 12px;
          padding: 0.85rem 1.15rem;
          font-size: 0.86rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .progress-pill {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 0.65rem 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>

      {/* Header */}
      <div className="verify-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 className="verify-title">
            <span>🔍</span> Verify Update
          </h1>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6ee7b7',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
            🌐 Web Hash Lookup Active (Auto-Register)
          </div>
        </div>
        <p className="verify-subtitle">
          Submit a software update package for cryptographic file integrity and trust verification before installing.
        </p>
      </div>

      {/* 4-Step Pipeline Cards */}
      <div className="pipeline-steps">
        {STEPS.map((st) => (
          <div key={st.num} className="pipeline-card">
            <div className="step-number-badge">{st.num}</div>
            <div className="step-title-text">{st.title}</div>
            <div className="step-desc-text">{st.desc}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {progress && (
        <div className="progress-pill">
          <span style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⚙️</span>
          <span>{progress}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Software Details */}
        <div className="glass-card">
          <div className="card-header-bar">
            <div className="card-heading">
              <span>📋</span> Software & Publisher Metadata
            </div>
            <div className="preset-strip">
              <span style={{ color: '#64748b', fontSize: '0.72rem', alignSelf: 'center', marginRight: '0.2rem' }}>Quick Scenarios:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="preset-btn"
                  onClick={() => applyPreset(p.data)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label" htmlFor="softwareName">Software Name *</label>
              <input
                id="softwareName"
                name="softwareName"
                className="field-input"
                value={form.softwareName}
                onChange={handleChange}
                placeholder="e.g. Mozilla Firefox"
                required
              />
            </div>
            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label" htmlFor="claimedVersion">Version *</label>
                {form.claimedVersion && !/^\d+(\.\d+)+(-[a-zA-Z0-9.]+)?$/.test(form.claimedVersion.trim()) && (
                  <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>Format: e.g. 1.0.0 or 127.0.1</span>
                )}
              </div>
              <input
                id="claimedVersion"
                name="claimedVersion"
                className="field-input"
                value={form.claimedVersion}
                onChange={handleChange}
                placeholder="e.g. 127.0.1"
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="publisher">Publisher *</label>
              <input
                id="publisher"
                name="publisher"
                className="field-input"
                value={form.publisher}
                onChange={handleChange}
                placeholder="e.g. Mozilla Foundation"
                required
              />
            </div>
            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="field-label" htmlFor="referenceHash">Reference SHA-256 Hash (optional)</label>
                {form.referenceHash && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: form.referenceHash.length === 64 && /^[a-fA-F0-9]{64}$/.test(form.referenceHash) ? '#4ade80' : '#fbbf24',
                  }}>
                    {form.referenceHash.length}/64 {form.referenceHash.length === 64 ? '✓' : 'chars'}
                  </span>
                )}
              </div>
              <input
                id="referenceHash"
                name="referenceHash"
                className="field-input"
                value={form.referenceHash}
                onChange={handleChange}
                placeholder="64-character hex string (or leave blank to use registry)"
                maxLength={64}
              />
            </div>
          </div>
        </div>

        {/* Update File Upload */}
        <div className="glass-card">
          <div className="card-header-bar">
            <div className="card-heading">
              <span>📦</span> Update Package Binary *
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            className={`dropzone-box ${dragging ? 'active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current.click()}
          >
            <div className="upload-icon-pulse">📂</div>
            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem' }}>
              Drag & drop software file here, or <span style={{ color: '#38bdf8' }}>click to browse</span>
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: '0.4rem', color: '#64748b' }}>
              Max 500 MB — Any installer binary, executable, archive (.exe, .zip, .tar, .bin)
            </div>
            {file && (
              <div
                className="selected-file-chip"
                style={{
                  borderColor: file.size === 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.35)',
                  background: file.size === 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.12)',
                  color: file.size === 0 ? '#f87171' : '#38bdf8',
                }}
              >
                <span>{file.size === 0 ? '⚠️' : '✓'}</span>
                <span>{file.name}</span>
                <span style={{ color: file.size === 0 ? '#f87171' : '#94a3b8' }}>
                  ({file.size === 0 ? '0 bytes — Empty' : file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1024 / 1024).toFixed(2)} MB`})
                </span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />

          {/* Optional Signature Attachment */}
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}>Detached Cryptographic Signature (Optional)</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Optional .sig / .p7s signature for RSA attestation</div>
            </div>
            <button
              type="button"
              className="preset-btn"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: sigFile ? '#38bdf8' : '#94a3b8' }}
              onClick={() => sigRef.current.click()}
            >
              {sigFile ? `✓ ${sigFile.name}` : '📎 Attach Signature File'}
            </button>
            <input ref={sigRef} type="file" style={{ display: 'none' }} onChange={(e) => setSigFile(e.target.files[0])} />
          </div>
        </div>

        <button
          type="submit"
          className="submit-verify-btn"
          disabled={loading}
          data-testid="submit-btn"
        >
          <span>{loading ? '⚙️' : '🔍'}</span>
          <span>{loading ? 'Running Cryptographic Verification…' : 'Verify Update Now'}</span>
        </button>
      </form>
    </div>
  );
};

export default VerifyUpdate;
