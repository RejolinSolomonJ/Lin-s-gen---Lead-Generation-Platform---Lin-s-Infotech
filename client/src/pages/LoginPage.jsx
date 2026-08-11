import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f4f6f9 0%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 440, padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Brand Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="Lin's Infotech Logo"
            style={{ width: 100, height: 100, objectFit: 'contain', margin: '0 auto 16px', filter: 'drop-shadow(0 6px 16px rgba(4, 120, 87, 0.15))' }}
          />
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Lin's Gen
          </h1>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#64748b' }}>
            Lead Generation Platform · Lin's Infotech
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{ padding: 36, background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 12px 36px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: 42, height: 44 }}
                  placeholder="admin@linsinfotech.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: 42, height: 44 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, marginBottom: 20,
                background: '#fee2e2', border: '1px solid #fca5a5',
                color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.9375rem', height: 46 }}
            >
              {loading ? 'Signing in...' : 'Sign In to Lin\'s Gen'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 24,
          fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500,
        }}>
          © {new Date().getFullYear()} Lin's Infotech. Internal Sales Tool.
        </p>
      </div>
    </div>
  );
}
