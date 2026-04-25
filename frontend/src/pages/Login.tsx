import React, { useState } from 'react';
import { Presentation, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return setError("Please enter your credentials.");
    
    setError(null);
    setLoading(true);
    
    try {
      const res = await api.post('/login', { username, password });
      if (res.data.token) {
        onLoginSuccess(res.data.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Authentication failed. Server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6">
            <Presentation className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Timetabler <span className="text-indigo-500">Pro</span></h1>
          <p className="text-slate-500 font-medium">Enterprise Schedule Architecture</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-10 border border-slate-100 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

          <h2 className="text-xl font-bold text-slate-800 mb-8">System Access</h2>

          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-2xl flex items-center text-sm font-bold border border-rose-100 mb-6">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black tracking-widest text-slate-400 uppercase">Administrator ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition font-bold text-slate-800 placeholder-slate-400 shadow-sm"
                  placeholder="Administrator ID"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black tracking-widest text-slate-400 uppercase">Access Passkey</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition font-bold text-slate-800 placeholder-slate-400 shadow-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black tracking-wide shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-slate-900/30 transition disabled:opacity-50 active:scale-[0.98] flex items-center justify-center mt-4"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Authenticate Session <ArrowRight className="ml-2 w-5 h-5" /></>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-xs font-medium tracking-wide mt-8">
          Authorized Personnel Only. Core Engine v2.4.
        </p>

      </div>
    </div>
  );
};

export default Login;
