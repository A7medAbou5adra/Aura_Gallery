'use client';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/lib/redux/slices/authSlice';
import api from '@/lib/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(loginSuccess(data));
      window.location.href = '/gallery';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-brand-charcoal p-10 rounded-lg shadow-2xl border border-gray-800 w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-gold to-brand-champagne"></div>
          <h2 className="text-3xl font-serif text-white mb-8 text-center">Welcome Back</h2>
          
          {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-6 text-sm">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2 uppercase tracking-wide">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-brand-gold transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-brand-gold transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="w-full py-4 bg-brand-gold text-brand-dark font-bold rounded shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:bg-brand-champagne transition duration-300">
              SIGN IN
            </button>
          </form>
          <div className="mt-8 text-center text-gray-400 text-sm">
            Don't have an account? <a href="/register" className="text-brand-gold hover:underline">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
