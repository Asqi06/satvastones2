import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';


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
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
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
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Google Authentication failed');
      }
    } catch (err) {
      setError('Server connection failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight text-stone-900">
            {mode === 'login' ? 'Welcome Back' : 'Join The Tribe'}
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500">
            {mode === 'login' ? 'Access your aesthetic collection' : 'Start your aesthetic journey today'}
          </p>
        </div>

        <div className="space-y-8 bg-stone-50 p-8 md:p-12 shadow-sm border border-stone-100">
          <div className="space-y-4">
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

            <button className="w-full flex items-center justify-center gap-2 border border-stone-200 py-3 text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all opacity-50 grayscale hover:grayscale-0 hover:opacity-100">
              <Github className="h-3 w-3" /> Github
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
            <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest"><span className="bg-stone-50 px-4 text-stone-400">Or use email</span></div>
          </div>

          {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}
          <form className="space-y-6" onSubmit={handleAuth}>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                  <User className="h-3 w-3" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden" 
                  placeholder="NAME"
                  required
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden" 
                placeholder="EMAIL"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2">
                <Lock className="h-3 w-3" /> Password
              </label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border-b border-stone-200 bg-transparent py-3 text-sm focus:border-black outline-hidden" 
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-black">Forgot Password?</button>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-xl disabled:bg-stone-400"
            >
              {loading ? 'Verifying...' : (mode === 'login' ? 'Access Panel' : 'Create Account')} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 hover:text-black transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Join Now" : "Already a member? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
