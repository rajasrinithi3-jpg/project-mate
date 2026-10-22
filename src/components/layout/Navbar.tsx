import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  LogOut, 
  User as UserIcon, 
  Settings as SettingsIcon,
  Sparkles,
  ArrowRightLeft,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { api } from '../../services/api';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate, activePage }) => {
  const { user, logout, quickSwitch } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch unread notifications count
  useEffect(() => {
    if (!user) return;
    const loadUnread = async () => {
      try {
        const res = await api.getNotifications();
        setUnreadCount(res.unreadCount);
      } catch {
        // ignore
      }
    };
    loadUnread();
    const interval = setInterval(loadUnread, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const demoStudents = [
    { id: 'usr_lokitha', name: 'Lokitha A', dept: 'IT (2nd Yr)' },
    { id: 'usr_riya', name: 'Riya Sharma', dept: 'CSE (2nd Yr)' },
    { id: 'usr_arjun', name: 'Arjun Mehta', dept: 'CSE (3rd Yr)' },
    { id: 'usr_sneha', name: 'Sneha R', dept: 'AI (2nd Yr)' },
    { id: 'usr_vikram', name: 'Vikram K', dept: 'IT (3rd Yr)' },
    { id: 'usr_ananya', name: 'Ananya S', dept: 'ECE (3rd Yr)' },
    { id: 'usr_karthik', name: 'Karthik N', dept: 'DS (2nd Yr)' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`find-teammates?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full gap-4">
        {/* Left: Mobile sidebar toggle & brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div 
            onClick={() => onNavigate('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer md:hidden select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              P
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">ProjectMate</span>
          </div>
        </div>

        {/* Middle: Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search students, skills (e.g. Python, React), or projects..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
          />
        </form>

        {/* Right: Actions, Quick student tester, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher (Crucial for test evaluation of invite -> accept -> team journey) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSwitchMenu(!showSwitchMenu);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
              title="Test multi-student flow by switching account in 1 click"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Switch Student</span>
              <ChevronDown className="w-3 h-3 text-indigo-500" />
            </button>

            {showSwitchMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-in"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Switch Student</p>
                  <p className="text-xs text-slate-500">Test collaboration & invitation workflows</p>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {demoStudents.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        quickSwitch(s.id);
                        setShowSwitchMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        user?.id === s.id ? 'bg-indigo-50/70 text-indigo-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.dept}</p>
                      </div>
                      {user?.id === s.id && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">Current</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications button */}
          <button
            type="button"
            onClick={() => onNavigate('notifications')}
            className={`relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
              activePage === 'notifications' ? 'bg-slate-100 text-indigo-600' : ''
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User profile avatar / menu */}
          {user && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowSwitchMenu(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all"
                aria-label="User menu"
              >
                <Avatar src={user.photoURL} name={user.name} size="sm" />
                <span className="hidden md:block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scale-in"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                        {user.department} • {user.year}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => onNavigate('profile')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => onNavigate('settings')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
