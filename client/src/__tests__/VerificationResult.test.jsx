/**
 * __tests__/VerificationResult.test.jsx
 * Tests the verification result display component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../App';
import VerificationResult from '../pages/VerificationResult';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockAuth = { user: { username: 'admin', role: 'admin' }, login: jest.fn(), logout: jest.fn() };

const buildEvidence = (overrides = []) => [
  { check: 'Integrity Verification', component: 'Component 2', result: 'MATCH', detail: 'Hash matched.' },
  { check: 'Authenticity (Signature)', component: 'Component 3', result: 'VALID', detail: 'Signature valid.' },
  { check: 'Publisher / Trust Verification', component: 'Component 3', result: 'MATCH', detail: 'Publisher trusted.' },
  { check: 'Version / Freshness', component: 'Component 3', result: 'OK', detail: 'Latest version.' },
  { check: 'Trust Management History', component: 'Component 4', result: 'PRIOR_RECORD', detail: 'Prior VERIFIED record.' },
  ...overrides,
];

const renderWithResult = (result) =>
  render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter initialEntries={[{ pathname: '/result', state: { result } }]}>
        <Routes>
          <Route path="/result" element={<VerificationResult />} />
          <Route path="/verify" element={<div>Verify Page</div>} />
          <Route path="/history" element={<div>History Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('VerificationResult page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows fallback UI when no result in state', () => {
    render(
      <AuthContext.Provider value={mockAuth}>
        <MemoryRouter initialEntries={[{ pathname: '/result' }]}>
          <Routes><Route path="/result" element={<VerificationResult />} /></Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByText(/No verification result found/i)).toBeInTheDocument();
  });

  it('displays VERIFIED verdict badge', () => {
    const result = {
      result: 'VERIFIED', softwareName: 'Firefox', claimedVersion: '127.0.1',
      publisher: 'Mozilla', timestamp: new Date().toISOString(),
      recommendation: 'All checks passed. Safe to install.',
      evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
  });

  it('displays UNTRUSTED verdict badge', () => {
    const result = {
      result: 'UNTRUSTED', softwareName: 'BadApp', claimedVersion: '1.0.0',
      publisher: 'EvilCorp', timestamp: new Date().toISOString(),
      recommendation: 'Do NOT install. Hash mismatch detected.',
      evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByText('UNTRUSTED')).toBeInTheDocument();
  });

  it('displays SUSPICIOUS verdict badge', () => {
    const result = {
      result: 'SUSPICIOUS', softwareName: 'SomeApp', claimedVersion: '2.0.0',
      publisher: 'SomeCorp', timestamp: new Date().toISOString(),
      recommendation: 'Exercise caution.',
      evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByText('SUSPICIOUS')).toBeInTheDocument();
  });

  it('displays UNKNOWN verdict — not treated as UNTRUSTED', () => {
    const result = {
      result: 'UNKNOWN', softwareName: 'NewTool', claimedVersion: '1.0.0',
      publisher: 'StartupCorp', timestamp: new Date().toISOString(),
      recommendation: 'Insufficient reference data. Not a security failure.',
      evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
    expect(screen.queryByText('UNTRUSTED')).not.toBeInTheDocument();
  });

  it('displays the recommendation text', () => {
    const rec = 'All checks passed. You may proceed.';
    const result = {
      result: 'VERIFIED', softwareName: 'App', claimedVersion: '1.0', publisher: 'Corp',
      timestamp: new Date().toISOString(), recommendation: rec, evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByTestId('recommendation')).toHaveTextContent(rec);
  });

  it('renders the evidence table with all check rows', () => {
    const result = {
      result: 'VERIFIED', softwareName: 'App', claimedVersion: '1.0', publisher: 'Corp',
      timestamp: new Date().toISOString(), recommendation: 'OK.', evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByText('Integrity Verification')).toBeInTheDocument();
    expect(screen.getByText('Authenticity (Signature)')).toBeInTheDocument();
    expect(screen.getByText('Trust Management History')).toBeInTheDocument();
  });

  it('shows Approve and Reject buttons', () => {
    const result = {
      result: 'VERIFIED', softwareName: 'App', claimedVersion: '1.0', publisher: 'Corp',
      timestamp: new Date().toISOString(), recommendation: 'OK.', evidence: buildEvidence(),
    };
    renderWithResult(result);
    expect(screen.getByText(/Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/Reject/i)).toBeInTheDocument();
  });
});
