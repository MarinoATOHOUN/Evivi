
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Camera, Globe, Briefcase, Check, Loader2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { userService } from '../../services/user.service';

const COUNTRIES = [
  'Ghana', 'Nigeria', 'Senegal', 'Ivory Coast', 'Benin', 'Togo', 'Cameroon', 'Kenya', 'Ethiopia', 'South Africa', 'Mali', 'Burkina Faso'
];

const STATUS_OPTIONS = [
  'Professional Chef', 'Gastronomer', 'Home Cook', 'Food Blogger', 'Culinary Student', 'Sommelier', 'Recipe Developer'
];

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('Benin');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const user = await userService.getCurrentUser();
        setUsername(user.username);
        setEmail(user.email);
        setBio(user.bio || '');
        setCountry(user.country || 'Benin');
        setSelectedStatuses(user.professional_status || []);
        setProfileImage(user.avatar);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const userData: any = {
        username,
        bio,
        country,
        professional_status: selectedStatuses,
      };

      if (imageFile) {
        userData.avatar = imageFile;
      }

      await userService.updateProfile(userData);
      navigate('/profile');
    } catch (err: any) {
      console.error("Failed to update profile", err);
      setError(err.response?.data?.message || "Failed to update profile. Check your information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center bg-white min-h-screen">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-center sticky top-0 bg-[#FDF8F5] z-10 border-b border-gray-100/50 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 text-gray-900 active:scale-90 transition-transform bg-white rounded-full shadow-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Edit Profile</h1>
      </header>

      <div className="px-6 pb-12 flex flex-col items-center">
        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mt-4 mb-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white transition-transform group-active:scale-95">
              <img
                src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'default'}&backgroundColor=F3EBE5`}
                className="w-full h-full object-cover"
                alt="Profile Avatar"
              />
            </div>
            <div className="absolute bottom-1 right-2 w-10 h-10 bg-[#E85D1A] rounded-full border-4 border-[#FDF8F5] flex items-center justify-center text-white shadow-lg">
              <Camera size={18} />
            </div>
          </div>
          <button
            type="button"
            onClick={handleImageClick}
            className="mt-4 text-[#E85D1A] font-black text-lg tracking-tight active:opacity-70 uppercase"
          >
            Change Photo
          </button>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl mb-8 font-bold text-sm">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSave} className="w-full space-y-7">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-gray-400 shadow-sm cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 ml-1">Email cannot be changed currently.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Country / Region</label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 pr-12 text-base font-bold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={18} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <Briefcase size={16} className="text-gray-400" />
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Professional Status</label>
              <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Multi-choice</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {STATUS_OPTIONS.map((status) => {
                const isSelected = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 uppercase tracking-wider ${isSelected
                      ? 'bg-[#E85D1A] border-[#E85D1A] text-white shadow-lg shadow-orange-900/10'
                      : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200'
                      }`}
                  >
                    {isSelected && <Check size={14} strokeWidth={4} />}
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-base font-bold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all resize-none leading-relaxed"
              placeholder="Tell us about your culinary journey..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E85D1A] text-white font-black py-5 rounded-3xl shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:grayscale"
            >
              {isSubmitting ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span className="text-xl uppercase tracking-tighter">Save Profile</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-gray-400 font-black text-sm py-2 active:opacity-60 uppercase tracking-widest"
            >
              Cancel Changes
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default EditProfile;
