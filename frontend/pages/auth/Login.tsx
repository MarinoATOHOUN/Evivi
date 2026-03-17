
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ChevronLeft, EyeOff } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const [email, setEmail] = useState(''); // Backend uses email as USERNAME_FIELD
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.login({
        email, // Backend expects 'email' field
        password
      });

      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const detail = errorData.detail || errorData.message || Object.values(errorData)[0];
        setError(Array.isArray(detail) ? detail[0] : detail);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper withPadding={true} className="bg-white flex flex-col h-full min-h-screen">
      <header className="relative flex items-center justify-center py-4">
        <button onClick={() => navigate(-1)} className="absolute left-0 text-gray-900 active:scale-90 transition-transform">
          <ChevronLeft size={28} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Login</h2>
      </header>

      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="w-28 h-28 bg-[#FDF8F5] rounded-full flex items-center justify-center mb-12">
          <div className="w-20 h-20 bg-[#124E4C] rounded-lg flex flex-col items-center justify-center p-2 shadow-lg">
            <span className="text-white font-black text-[14px] leading-tight tracking-tighter">ÉVIVI</span>
            <span className="text-white/70 font-bold text-[5px] uppercase tracking-[0.2em] mt-0.5">GASTRONOMY</span>
          </div>
        </div>
        <h1 className="text-4xl font-black mb-2 text-gray-900">Welcome back</h1>
        <p className="text-[#E85D1A] text-sm font-medium">Enter your kitchen and explore African flavors</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold animate-shake">
          {error}
        </div>
      )}

      <form className="space-y-6 px-2" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[15px] font-bold text-gray-900">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={isLoading}
            className="w-full border border-gray-200 rounded-2xl px-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-bold text-gray-900">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              className="w-full border border-gray-200 rounded-2xl px-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          <div className="text-right">
            <button type="button" className="text-[#E85D1A] text-sm font-bold">Forgot password?</button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#E85D1A] text-white font-black py-5 rounded-[28px] shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all text-xl mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-12 px-2">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] bg-gray-100 flex-1"></div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Or continue with</span>
          <div className="h-[1px] bg-gray-100 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-4 font-black text-sm tracking-widest text-gray-900 active:bg-gray-50 transition-colors">
            GOOGLE
          </button>
          <button className="flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-4 font-black text-sm tracking-widest text-gray-900 active:bg-gray-50 transition-colors">
            iOS
          </button>
        </div>
      </div>

      <div className="mt-auto pt-10 pb-6 text-center text-sm font-medium text-gray-500">
        Don't have an account? <Link to="/register" className="text-[#E85D1A] font-black ml-1">Join the feast</Link>
      </div>
    </PageWrapper>
  );
};

export default Login;
