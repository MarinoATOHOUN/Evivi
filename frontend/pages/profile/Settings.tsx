
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Lock, 
  Bell, 
  Eye, 
  Globe, 
  HelpCircle, 
  FileText, 
  Info,
  LogOut,
  Bookmark
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  isLast?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, label, value, onClick, isLast }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#E85D1A]">
        {icon}
      </div>
      <span className="text-[15px] font-bold text-gray-800">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-sm text-gray-400 font-medium">{value}</span>}
      <ChevronRight size={18} className="text-gray-300" />
    </div>
  </button>
);

const Settings: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, clear auth here
    navigate('/login');
  };

  return (
    <PageWrapper withPadding={false} className="bg-[#FDF8F5]">
      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-center sticky top-0 bg-[#FDF8F5] z-10 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-4 p-2 text-gray-900 active:scale-90 transition-transform"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>

      <div className="px-6 py-8 space-y-10">
        {/* Account Management */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Management</h2>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <SettingsItem 
              icon={<User size={20} />} 
              label="Edit Profile" 
              onClick={() => navigate('/profile/edit')}
            />
            <SettingsItem 
              icon={<Bookmark size={20} />} 
              label="Saved Recipes" 
              onClick={() => navigate('/profile/saved')}
            />
            <SettingsItem 
              icon={<Lock size={20} />} 
              label="Change Password" 
              isLast 
            />
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferences</h2>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <SettingsItem 
              icon={<Bell size={20} />} 
              label="Notifications" 
            />
            <SettingsItem 
              icon={<Eye size={20} />} 
              label="Privacy Settings" 
            />
            <SettingsItem 
              icon={<Globe size={20} />} 
              label="Language" 
              value="English"
              isLast 
            />
          </div>
        </section>

        {/* Support & Legal */}
        <section className="space-y-4">
          <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Support & Legal</h2>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
            <SettingsItem 
              icon={<HelpCircle size={20} />} 
              label="Help Center" 
              onClick={() => navigate('/help')}
            />
            <SettingsItem 
              icon={<FileText size={20} />} 
              label="Terms of Service" 
              onClick={() => navigate('/terms')}
            />
            <SettingsItem 
              icon={<Info size={20} />} 
              label="About Évivi" 
              onClick={() => navigate('/about')}
              isLast 
            />
          </div>
        </section>

        {/* Log Out */}
        <div className="pt-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-5 bg-red-50 text-red-600 font-bold text-lg rounded-2xl border border-red-100 active:scale-[0.98] transition-all"
          >
            <LogOut size={22} />
            Log Out
          </button>
        </div>

        {/* Footer */}
        <footer className="pt-4 pb-12 text-center">
          <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em]">ÉVIVI APP v1.0.4</p>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default Settings;
