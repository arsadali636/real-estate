'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
  Kanban,
  Building2,
  Layers,
  BarChart3,
  CalendarCheck,
  MapPin,
  ShieldCheck,
  Building,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const EstatevoLogoMark = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="7" fill="#1D4ED8" />
    <path d="M7 8C7 6.89543 7.89543 6 9 6H23C24.1046 6 25 6.89543 25 8V11H13V14H22V17H13V21H25V24C25 25.1046 24.1046 26 23 26H9C7.89543 26 7 25.1046 7 24V8Z" fill="#FFFFFF" />
    <path d="M13 11H25V14H13V11Z" fill="#38BDF8" />
    <circle cx="21" cy="19" r="1.5" fill="#38BDF8" />
  </svg>
);

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Global Config', href: '/settings', icon: SettingsIcon },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Pipeline', href: '/pipeline', icon: Kanban },
  { name: 'Projects', href: '/projects', icon: Building2 },
  { name: 'Properties', href: '/projects', icon: Layers },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Follow-ups', href: '/follow-ups', icon: CalendarCheck },
  { name: 'Site Visits', href: '/site-visits', icon: MapPin },
  { name: 'Team', href: '/team', icon: ShieldCheck },
  { name: 'Org Profile', href: '/settings', icon: Building },
];

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[145px] sm:w-[155px] bg-[#100D2B] text-slate-300 flex flex-col h-full select-none border-r border-[#1B183E] shrink-0">
      {/* Brand & Organization */}
      <div className="pt-4 pb-3 px-3 border-b border-[#1C1844] flex flex-col items-center text-center">
        <Link href="/" className="flex flex-col items-center gap-1.5 group" onClick={onCloseMobile}>
          <div className="flex items-center gap-1.5">
            <EstatevoLogoMark className="w-6 h-6 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-white tracking-wider text-sm font-sans">ESTATEVO</span>
          </div>
          <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold scale-90">
            Real Estate CRM
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              title={item.name}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-[#10B981] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User / Logout */}
      <div className="p-2 border-t border-[#1C1844] space-y-2">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Sign out of ESTATEVO"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Log Out</span>
        </button>
        <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>v1.0.220</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online & Connected" />
        </div>
      </div>
    </aside>
  );
};
