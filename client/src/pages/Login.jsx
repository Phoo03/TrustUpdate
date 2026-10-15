import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../App';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSocialLoginNotice = (provider) => {
    setError('');
    setInfoMsg(`${provider} Single Sign-On is not configured for this deployment. Please sign in with your username and password.`);
  };

  const handleForgotPassword = () => {
    setError('');
    setInfoMsg('Password reset is not configured for self-service in this release. Please contact your system administrator.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('/auth/register', {
          username: form.username,
          password: form.password,
          role: 'viewer',
        });
      }
      const { data } = await api.post('/auth/login', {
        username: form.username,
        password: form.password,
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      const apiErr =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        (isRegister ? 'Registration failed. Try a different username.' : 'Login failed. Please check credentials.');
      setError(apiErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="securex-login-outer">
      <style>{`
        .securex-login-outer {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 2rem;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background:
            radial-gradient(circle at 82% 8%, rgba(0, 238, 255, 0.75) 0%, rgba(0, 162, 255, 0.35) 22%, transparent 52%),
            radial-gradient(circle at 15% 15%, rgba(2, 132, 199, 0.45) 0%, transparent 48%),
            radial-gradient(circle at 50% 95%, rgba(0, 195, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #041d42 0%, #031129 45%, #020b1a 100%);
        }

        /* Sparkling outer cyber particles matching reference frame */
        .outer-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background-image:
            radial-gradient(2.5px 2.5px at 78% 6%, #ffffff 90%, transparent),
            radial-gradient(3px 3px at 85% 10%, #a5f3fc 90%, transparent),
            radial-gradient(2px 2px at 72% 11%, #67e8f9 90%, transparent),
            radial-gradient(3.5px 3.5px at 91% 7%, #ffffff 90%, transparent),
            radial-gradient(2px 2px at 64% 5%, #38bdf8 90%, transparent),
            radial-gradient(2.5px 2.5px at 45% 4%, #7dd3fc 85%, transparent),
            radial-gradient(2px 2px at 28% 8%, #38bdf8 80%, transparent),
            radial-gradient(2.5px 2.5px at 12% 94%, #38bdf8 85%, transparent),
            radial-gradient(3px 3px at 88% 93%, #67e8f9 85%, transparent),
            radial-gradient(2px 2px at 54% 96%, #a5f3fc 80%, transparent);
          animation: sparklePulse 4s ease-in-out infinite alternate;
        }

        @keyframes sparklePulse {
          0% { opacity: 0.75; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.015); }
        }

        /* Inner Main Dark Illustration Stage */
        .login-stage-frame {
          position: relative;
          z-index: 5;
          width: 100%;
          max-width: 1140px;
          min-height: 640px;
          border-radius: 18px;
          overflow: hidden;
          background-color: #050a14;
          background-image: url('/login_hands_padlock_bg.jpg');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.85),
            0 0 50px rgba(0, 210, 255, 0.22),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 2.8rem 4rem;
          box-sizing: border-box;
          animation: stageFadeIn 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes stageFadeIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.985); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Subtle pulsing aura over the holographic padlock in the center-right */
        .padlock-glow-overlay {
          position: absolute;
          left: 57%;
          top: 54%;
          transform: translate(-50%, -50%);
          width: 240px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 211, 238, 0.22) 0%, rgba(14, 165, 233, 0.06) 55%, transparent 75%);
          pointer-events: none;
          animation: lockPulse 3s ease-in-out infinite alternate;
        }

        @keyframes lockPulse {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.92); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.12); }
        }

        /* Left Frosted Glass Card */
        .glass-login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 375px;
          background: rgba(52, 58, 70, 0.56);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 24px;
          padding: 2.2rem 2rem 2rem 2rem;
          box-sizing: border-box;
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.55),
            inset 0 1px 1px rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* Top Header inside Card */
        .card-top-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.2rem;
        }

        .welcome-text {
          font-size: 0.9rem;
          font-weight: 400;
          color: #f1f5f9;
          margin: 0;
        }

        .welcome-brand {
          color: #22d3ee;
          font-weight: 700;
        }

        .no-account-box {
          text-align: right;
          font-size: 0.72rem;
          line-height: 1.35;
          color: #cbd5e1;
        }

        .signup-switch-btn {
          background: none;
          border: none;
          color: #22d3ee;
          font-size: 0.74rem;
          font-weight: 600;
          padding: 0;
          cursor: pointer;
          display: inline-block;
        }

        .signup-switch-btn:hover {
          text-decoration: underline;
          color: #67e8f9;
        }

        .signin-heading {
          font-size: 2.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0.1rem 0 1.35rem 0;
          letter-spacing: -0.02em;
        }

        /* Social Sign-in Row */
        .social-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.55rem;
        }

        .google-btn {
          flex: 1;
          height: 40px;
          background: #eef6ff;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          color: #3b82f6;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .google-btn:hover {
          background: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
        }

        .social-icon-btn {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .social-icon-btn:hover {
          transform: translateY(-1px);
          background: #f8fafc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
        }

        /* Input Groups */
        .field-group {
          margin-bottom: 1.15rem;
        }

        .field-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 400;
          color: #f1f5f9;
          margin-bottom: 0.45rem;
        }

        .white-input {
          width: 100%;
          height: 42px;
          padding: 0 0.95rem;
          background: #ffffff;
          border: 1.5px solid transparent;
          border-radius: 8px;
          color: #0f172a;
          font-size: 0.82rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .white-input::placeholder {
          color: #94a3b8;
          font-size: 0.78rem;
        }

        .white-input:focus {
          border-color: #22d3ee;
          box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.25);
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 0.45rem;
        }

        .forgot-link {
          background: none;
          border: none;
          color: #38bdf8;
          font-size: 0.7rem;
          cursor: pointer;
          padding: 0;
        }

        .forgot-link:hover {
          color: #67e8f9;
          text-decoration: underline;
        }

        /* Action Row with Right-Aligned Cyan Sign In Button */
        .submit-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 1.25rem;
        }

        .cyan-signin-btn {
          width: 165px;
          height: 40px;
          background: linear-gradient(90deg, #19d3f3 0%, #22d3ee 100%);
          color: #041326;
          border: none;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 4px 16px rgba(34, 211, 238, 0.4);
        }

        .cyan-signin-btn:hover:not(:disabled) {
          background: linear-gradient(90deg, #38bdf8 0%, #67e8f9 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(34, 211, 238, 0.65);
        }

        .cyan-signin-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .alert-box {
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.25);
          border: 1px solid rgba(248, 113, 113, 0.5);
          color: #fecaca;
        }

        .alert-info {
          background: rgba(34, 211, 238, 0.18);
          border: 1px solid rgba(34, 211, 238, 0.45);
          color: #a5f3fc;
        }

        @media (max-width: 768px) {
          .login-stage-frame {
            padding: 1.5rem;
            justify-content: center;
            background-position: 65% center;
          }
          .submit-row {
            justify-content: center;
          }
          .cyan-signin-btn {
            width: 100%;
          }
        }
      `}</style>

      {/* Ambient Outer Particles */}
      <div className="outer-sparkles" aria-hidden="true" />

      {/* Main Dark Illustration Stage */}
      <div className="login-stage-frame">
        {/* Subtle animated glow over the holographic padlock */}
        <div className="padlock-glow-overlay" aria-hidden="true" />

        {/* Left Glassmorphic Sign-In Card */}
        <div className="glass-login-card">
          <div className="card-top-bar">
            <p className="welcome-text">
              Welcome to <span className="welcome-brand">TrustUpdate</span>
            </p>
            <div className="no-account-box">
              <div>{isRegister ? 'Have an Account?' : 'No Account?'}</div>
              <button
                type="button"
                className="signup-switch-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setInfoMsg('');
                }}
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>

          <h1 className="signin-heading">{isRegister ? 'Sign up' : 'Sign in'}</h1>

          {/* Social Sign-in Row */}
          <div className="social-row">
            <button
              type="button"
              className="google-btn"
              onClick={() => handleSocialLoginNotice('Google')}
              title="Sign in with Google (SSO)"
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              className="social-icon-btn"
              onClick={() => handleSocialLoginNotice('Facebook')}
              title="Sign in with Facebook (SSO)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            <button
              type="button"
              className="social-icon-btn"
              onClick={() => handleSocialLoginNotice('Apple')}
              title="Sign in with Apple (SSO)"
            >
              <svg width="17" height="17" viewBox="0 0 384 512" fill="#000000">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
            </button>
          </div>

          {error && <div className="alert-box alert-error">{error}</div>}
          {infoMsg && <div className="alert-box alert-info">{infoMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="username">
                Enter your username or email address
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="white-input"
                value={form.username}
                onChange={handleChange}
                placeholder="Username or email address"
                autoComplete="username"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Enter your Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="white-input"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <div className="forgot-row">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div className="submit-row">
              <button
                type="submit"
                className="cyan-signin-btn"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : isRegister
                  ? 'Sign Up'
                  : 'Sign In'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
