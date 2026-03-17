
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, ChevronLeft, EyeOff, Camera } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.register({
        username,
        email,
        password,
        password_confirm: password
      });

      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object') {
        const firstErrorKey = Object.keys(errorData)[0];
        const errorVal = errorData[firstErrorKey];
        const errorMessage = Array.isArray(errorVal) ? errorVal[0] : errorVal;
        setError(`${firstErrorKey}: ${errorMessage}`);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your details.');
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
        <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
      </header>

      <div className="flex flex-col items-center mt-6 mb-10 text-center">
        {/* Profile Upload Section */}
        <div className="relative mb-8 cursor-pointer group" onClick={handleImageClick}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm transition-transform group-active:scale-95">
            {profileImage ? (
              <img src={profileImage} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-20 h-24 border-2 border-orange-200 rounded-t-full mt-8" />
                <div className="absolute top-8 w-12 h-12 border-2 border-orange-200 rounded-full" />
              </div>
            )}
          </div>
          <div className="absolute bottom-1 right-2 w-10 h-10 bg-[#E85D1A] rounded-full border-4 border-white flex items-center justify-center text-white shadow-md">
            <Camera size={18} />
          </div>
        </div>

        <h1 className="text-3xl font-black mb-1 text-gray-900">Join the Feast</h1>
        <p className="text-[#E85D1A] text-sm font-medium">Discover & Share African Flavors</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold animate-shake">
          {error}
        </div>
      )}

      <form className="space-y-6 px-2" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-[15px] font-bold text-gray-900">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@foodie_jollof"
            required
            disabled={isLoading}
            className="w-full border border-gray-200 rounded-2xl px-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[15px] font-bold text-gray-900">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="chef@kitchen.com"
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
              placeholder="Min. 8 characters"
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
        </div>

        <div className="flex items-start gap-3 py-2">
          <div className="mt-1">
            <input type="checkbox" className="w-5 h-5 rounded-md border-gray-200 accent-[#E85D1A]" required />
          </div>
          <p className="text-xs font-medium text-gray-500 leading-normal">
            I agree to the <Link to="/terms" className="text-[#E85D1A] font-bold">Terms of Service</Link> and <Link to="/privacy" className="text-[#E85D1A] font-bold">Privacy Policy</Link>.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#E85D1A] text-white font-black py-5 rounded-[28px] shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all text-xl ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-10 px-2">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] bg-gray-100 flex-1"></div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Or join with</span>
          <div className="h-[1px] bg-gray-100 flex-1"></div>
        </div>

        <div className="flex justify-center gap-6">
          <button className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center active:bg-gray-50 transition-colors shadow-sm">
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6 grayscale" alt="Google" />
          </button>
          <button className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center active:bg-gray-50 transition-colors shadow-sm">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </button>
          <button className="w-14 h-14 border border-gray-200 rounded-full flex items-center justify-center active:bg-gray-50 transition-colors shadow-sm">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center text-white">
              <span className="font-bold text-[10px]">C</span>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-auto pt-10 pb-6 text-center text-sm font-medium text-gray-600">
        Already a member? <Link to="/login" className="text-[#E85D1A] font-black ml-1">Log in to your account</Link>
      </div>
    </PageWrapper>
  );
};

export default Register;
