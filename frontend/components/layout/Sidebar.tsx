
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  PlusCircle, 
  Bookmark, 
  User, 
  Bell, 
  Settings, 
  HelpCircle, 
  Info 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  // Hide sidebar on specific full-screen paths
  const fullScreenPaths = [
    '/login',
    '/register',
    '/create-story',
    '/story'
  ];
  
  const isFullScreen = fullScreenPaths.some(path => 
    location.pathname.startsWith(path)
  );

  if (isFullScreen) return null;

  const menuItems = [
    { to: "/", icon: <Home size={22} />, label: "Feed" },
    { to: "/discover", icon: <Search size={22} />, label: "Discover" },
    { to: "/activity", icon: <Bell size={22} />, label: "Activity" },
    { to: "/profile/saved", icon: <Bookmark size={22} />, label: "Saved" },
    { to: "/profile", icon: <User size={22} />, label: "Profile" },
  ];

  const secondaryItems = [
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
    { to: "/help", icon: <HelpCircle size={20} />, label: "Help Center" },
    { to: "/about", icon: <Info size={20} />, label: "About Évivi" },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-24 xl:w-64 bg-white border-r border-gray-100 flex-col z-50 py-8 px-4 shadow-sm transition-all duration-300">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
        <div className="w-10 h-10 bg-[#E85D1A] rounded-xl flex items-center justify-center rotate-45 shrink-0 shadow-lg shadow-orange-500/20">
          <div className="w-4 h-4 bg-white -rotate-45 rounded-sm"></div>
        </div>
        <h1 className="hidden xl:block text-2xl font-black text-gray-900 tracking-tight">Évivi</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`
                flex items-center gap-4 px-3 py-3.5 rounded-2xl transition-all group relative
                ${isActive 
                  ? 'bg-orange-50 text-[#E85D1A]' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="hidden xl:block font-bold text-sm">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-[#E85D1A] rounded-r-full"
                />
              )}
            </NavLink>
          );
        })}

        <div className="pt-6">
          <NavLink
            to="/create"
            className="flex items-center gap-4 px-3 py-3.5 bg-[#E85D1A] text-white rounded-2xl shadow-lg shadow-orange-900/10 active:scale-95 transition-all group"
          >
            <PlusCircle size={22} strokeWidth={2.5} className="shrink-0" />
            <span className="hidden xl:block font-black text-sm uppercase tracking-wider">Create</span>
          </NavLink>
        </div>
      </nav>

      {/* Secondary Navigation - For less frequent items */}
      <div className="space-y-1 pt-6 border-t border-gray-50">
        <p className="hidden xl:block px-3 mb-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">Support</p>
        {secondaryItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-4 px-3 py-3 rounded-2xl transition-all group
              ${isActive 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
            `}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="hidden xl:block font-semibold text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
