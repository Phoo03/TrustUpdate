/**
 * __tests__/VerifyUpdate.test.jsx
 * Tests the verification submission form.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../App';
import VerifyUpdate from '../pages/VerifyUpdate';

// Mock the Axios API module
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import api from '../services/api';

const mockUser = { username: 'admin', role: 'admin' };
const mockAuth = { user: mockUser, login: jest.fn(), logout: jest.fn() };

const renderComponent = () =>
  render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter>
        <VerifyUpdate />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('VerifyUpdate page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the page title', () => {
    renderComponent();
    expect(screen.getByText('Verify Update')).toBeInTheDocument();
  });

  it('renders all 4 explainer steps', () => {
    renderComponent();
    expect(screen.getByText('Upload File')).toBeInTheDocument();
    expect(screen.getByText('Integrity Check')).toBeInTheDocument();
    expect(screen.getByText('Authenticity Check')).toBeInTheDocument();
    expect(screen.getByText('Trust Verdict')).toBeInTheDocument();
  });

  it('renders all required form fields', () => {
    renderComponent();
    expect(screen.getByLabelText(/Software Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Version/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Publisher/i)).toBeInTheDocument();
  });

  it('shows error when submitting without a file', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/Software Name/i), 'Firefox');
    await user.type(screen.getByLabelText(/Version/i), '127.0.1');
    await user.type(screen.getByLabelText(/Publisher/i), 'Mozilla');

    const submitBtn = screen.getByTestId('submit-btn');
    await user.click(submitBtn);

    expect(await screen.findByText(/Please select a file to verify/i)).toBeInTheDocument();
  });

  it('calls API and navigates to /result on successful verification', async () => {
    const user = userEvent.setup();
    const mockResult = {
      result: 'VERIFIED',
      evidence: [],
      recommendation: 'All checks passed.',
      timestamp: new Date().toISOString(),
    };
    api.post.mockResolvedValueOnce({ data: mockResult });

    renderComponent();

    await user.type(screen.getByLabelText(/Software Name/i), 'Firefox');
    await user.type(screen.getByLabelText(/Version/i), '127.0.1');
    await user.type(screen.getByLabelText(/Publisher/i), 'Mozilla');

    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['binary content'], 'firefox.exe', { type: 'application/octet-stream' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    const submitBtn = screen.getByTestId('submit-btn');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/verify', expect.any(FormData), expect.any(Object));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/result', expect.objectContaining({ state: { result: mockResult } }));
    });
  });

  it('shows error message when API call fails', async () => {
    const user = userEvent.setup();
    api.post.mockRejectedValueOnce({ response: { data: { error: 'Server error occurred.' } } });

    renderComponent();

    await user.type(screen.getByLabelText(/Software Name/i), 'Firefox');
    await user.type(screen.getByLabelText(/Version/i), '127.0.1');
    await user.type(screen.getByLabelText(/Publisher/i), 'Mozilla');

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['data'], 'test.exe', { type: 'application/octet-stream' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    await user.click(screen.getByTestId('submit-btn'));

    expect(await screen.findByText(/Server error occurred/i)).toBeInTheDocument();
  });
});
