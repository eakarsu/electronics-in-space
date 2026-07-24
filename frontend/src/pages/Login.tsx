import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { apiFetch } from '../api';

const demoEmail = import.meta.env.VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true' ? import.meta.env.VITE_DEMO_EMAIL || '' : '';
const demoPassword = import.meta.env.VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL === 'true' ? import.meta.env.VITE_DEMO_PASSWORD || '' : '';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      navigate('/chips');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  }

  function demoLogin() {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setTimeout(async () => {
      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        });
        localStorage.setItem('token', data.token);
        navigate('/chips');
      } catch (err: any) {
        setError(err.message || 'Login failed');
      }
    }, 0);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-900/40 border border-cyan-700/40 mb-4">
            <Cpu size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">SpaceLab</h1>
          <p className="text-gray-400 mt-2">Space Electronics Research Platform</p>
        </div>
        <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-4">
          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-600"
              placeholder="admin@demo.com"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-600"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-medium transition-colors">
            Sign In
          </button>
          <button type="button" disabled={!demoEmail || !demoPassword} onClick={demoLogin} className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-lg font-medium transition-colors text-sm disabled:opacity-50">
            Demo Login
          </button>
        </form>
      </div>
    </div>
  );
}
