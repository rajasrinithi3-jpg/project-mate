import React from 'react';
import { LayoutDashboard, Users, FolderKanban, ShieldCheck, UserCircle } from 'lucide-react';

interface BottomNavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activePage, onNavigate }) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'find-teammates', label: 'Search', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'my-team', label: 'Team', icon: ShieldCheck },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around h-14">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id || (tab.id === 'find-teammates' && activePage.startsWith('find-teammates'));

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors select-none ${
                isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
