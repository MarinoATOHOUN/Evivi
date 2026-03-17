
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, Bookmark, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  // Define full-screen pages where the navbar SHOULD NOT be visible
  const fullScreenPaths = [
    '/login',
    '/register',
    '/create',
    '/create-story',
    '/story'
  ];
  
  // Check if current path is a full-screen path
  const isFullScreen = fullScreenPaths.some(path => 
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  );

  if (isFullScreen) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around py-3 px-4 z-[100] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#E85D1A]' : 'text-gray-400'}`}
      >
        <Home size={24} />
        <span className="text-[10px] font-bold">Feed</span>
      </NavLink>
      
      <NavLink 
        to="/discover" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#E85D1A]' : 'text-gray-400'}`}
      >
        <Search size={24} />
        <span className="text-[10px] font-bold">Discover</span>
      </NavLink>

      <div className="relative -top-6">
        <NavLink 
          to="/create" 
          className="bg-[#E85D1A] w-14 h-14 rounded-full shadow-lg shadow-orange-200 text-white flex items-center justify-center transform active:scale-90 transition-transform"
        >
          <PlusCircle size={32} strokeWidth={2.5} />
        </NavLink>
      </div>

      <NavLink 
        to="/profile/saved" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#E85D1A]' : 'text-gray-400'}`}
      >
        <Bookmark size={24} />
        <span className="text-[10px] font-bold">Saved</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#E85D1A]' : 'text-gray-400'}`}
      >
        <User size={24} />
        <span className="text-[10px] font-bold">Profile</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
