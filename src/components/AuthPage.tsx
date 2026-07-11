import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';

export default function AuthPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/login' : '/signup';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) onLogin(data);
      else setError(data.error || 'Authentication failed');
    } catch (err) {
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) onLogin(data);
      else setError(data.error || 'Google Authentication failed');
    } catch (err) {
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Breadcrumb */}
      <div className="fixed top-0 left-0 right-0 px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100 bg-white z-10">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">{mode === 'login' ? 'Login' : 'Sign Up'}</span>
      </div>

      <div className="max-w-sm w-full space-y-6 pt-10">
        {/* Header */}
        <div className="bg-[#f79da6] rounded-xl px-6 py-5 text-center -mx-4 mb-0">
          <h1 className="text-lg font-bold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-white/80 text-[10px] mt-1">
            {mode === 'login' ? 'Access your aesthetic collection' : 'Start your aesthetic journey'}
          </p>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-xl p-5">
          {/* Google Login */}
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          </GoogleOAuthProvider>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest"><span className="bg-gray-50 px-3 text-gray-400">Or use email</span></div>
          </div>

          {error && <p className="text-[10px] font-bold text-red-500 text-center">{error}</p>}

          <form className="space-y-3" onSubmit={handleAuth}>
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 pl-9 pr-3 py-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f]" placeholder="Full Name" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-200 pl-9 pr-3 py-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f]" placeholder="Email Address" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-gray-200 pl-9 pr-3 py-2.5 text-xs rounded-lg bg-white outline-none focus:border-[#f2707f]" placeholder="Password" required />
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-[9px] font-bold text-gray-400 hover:text-[#f2707f]">Forgot Password?</button>
              </div>
            )}

            <button disabled={loading}
              className="w-full py-3 bg-[#f2707f] hover:bg-[#d4535f] text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:bg-gray-300">
              {loading ? 'Verifying...' : (mode === 'login' ? 'Login' : 'Create Account')} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-bold text-gray-500 hover:text-[#f2707f] transition-colors">
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
